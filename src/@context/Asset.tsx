import {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  useCallback,
  ReactNode
} from 'react'
import { Config, LoggerInstance } from '@oceanprotocol/lib'
import { CancelToken } from 'axios'
import { getAsset } from '@utils/aquarius'
import { useCancelToken } from '@hooks/useCancelToken'
import { getOceanConfig, sanitizeDevelopmentConfig } from '@utils/ocean'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { useIsMounted } from '@hooks/useIsMounted'
import { useMarketMetadata } from './MarketMetadata'
import { assetStateToString } from '@utils/assetState'
import { isValidDid } from '@utils/ddo'
import { useAddressConfig } from '@hooks/useAddressConfig'
import { useAccount, useNetwork } from 'wagmi'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Asset, Purgatory } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { parseCredentialPolicies } from '@components/Publish/_utils'

export interface AssetProviderValue {
  isInPurgatory: boolean
  purgatoryData: Purgatory
  asset: AssetExtended
  title: string
  owner: string
  error?: string
  isAssetNetwork: boolean
  isOwner: boolean
  oceanConfig: Config
  loading: boolean
  assetState: string
  fetchAsset: (token?: CancelToken) => Promise<void>
}

const AssetContext = createContext({} as AssetProviderValue)

function AssetProvider({
  did,
  children
}: {
  did: string
  children: ReactNode
}): ReactElement {
  const { appConfig } = useMarketMetadata()
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()

  const { isDDOWhitelisted } = useAddressConfig()
  const [isInPurgatory, setIsInPurgatory] = useState(false)
  const [purgatoryData, setPurgatoryData] = useState<Purgatory>()
  const [asset, setAsset] = useState<AssetExtended>()
  const [title, setTitle] = useState<string>()
  const [owner, setOwner] = useState<string>()
  const [isOwner, setIsOwner] = useState<boolean>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [isAssetNetwork, setIsAssetNetwork] = useState<boolean>()
  const [oceanConfig, setOceanConfig] = useState<Config>()
  const [assetState, setAssetState] = useState<string>()

  const newCancelToken = useCancelToken()
  const isMounted = useIsMounted()

  // -----------------------------------
  // Helper: Get and set asset based on passed DID
  // -----------------------------------
  const fetchAsset = useCallback(
    async (token?: CancelToken) => {
      if (!did) return
      const isDid = isValidDid(did)

      if (!isDid) {
        setError(`The url is not for a valid DID`)
        LoggerInstance.error(`[asset] Not a valid DID`)
        return
      }

      LoggerInstance.log('[asset] Fetching asset...')
      setLoading(true)

      if (!token) {
        LoggerInstance.error(`[asset] Token is undefined`)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const asset: Asset = await getAsset(did, token)

      parseCredentialPolicies(asset?.credentialSubject?.credentials)
      asset?.credentialSubject?.services?.forEach((service) => {
        parseCredentialPolicies(service.credentials)
      })

      const isWhitelisted = isDDOWhitelisted(asset)

      if (!asset) {
        setError(
          did +
            '\n\nWe could not find an asset for this DID in the cache. If you just published a new asset, wait some seconds and refresh this page.'
        )
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }

      if (!isWhitelisted) {
        setError(did + '\n\nThis DID can not be retrieved on this portal.')
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }

      if (asset.credentialSubject.nft.state === (1 | 2 | 3)) {
        setTitle(
          `This asset has been set as "${assetStateToString(
            asset.credentialSubject.nft.state
          )}" by the publisher`
        )
        setError(
          did + `\n\nPublisher Address: ${asset.credentialSubject.nft.owner}`
        )
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }
      if (asset) {
        setError(undefined)
        if (
          !asset?.credentialSubject.chainId ||
          !asset?.credentialSubject.services?.length
        )
          return

        const accessDetails = await Promise.all(
          asset.credentialSubject.services.map((service: Service) =>
            getAccessDetails(asset.credentialSubject.chainId, service)
          )
        )
        setAsset((prevState) => ({
          ...prevState,
          ...asset,
          accessDetails
        }))
        setTitle(asset.credentialSubject?.metadata?.name)
        setOwner(asset.credentialSubject.nft?.owner)
        setIsInPurgatory(asset.credentialSubject.purgatory?.state)
        setPurgatoryData(asset.credentialSubject.purgatory)
        setAssetState(assetStateToString(asset.credentialSubject.nft.state))
        LoggerInstance.log('[asset] Got asset', asset)
      }

      setLoading(false)
    },
    [did, accountId]
  )

  // -----------------------------------
  // Helper: Get and set asset access details
  // -----------------------------------
  const fetchAccessDetails = useCallback(async (): Promise<void> => {
    if (
      !asset?.credentialSubject?.chainId ||
      !asset?.credentialSubject?.services?.length
    )
      return

    const accessDetails: AccessDetails[] = await Promise.all(
      asset.credentialSubject?.services?.map((service: Service) =>
        getAccessDetails(asset.credentialSubject?.chainId, service)
      )
    )

    setAsset((prevState) => ({
      ...prevState,
      accessDetails
    }))
    LoggerInstance.log(`[asset] Got access details for ${did}`, accessDetails)
  }, [
    asset?.credentialSubject?.chainId,
    asset?.credentialSubject?.services,
    did
  ])

  // -----------------------------------
  // 1. Get and set asset based on passed DID
  // -----------------------------------
  useEffect(() => {
    if (!isMounted || !appConfig?.metadataCacheUri) return

    fetchAsset(newCancelToken())
  }, [appConfig?.metadataCacheUri, fetchAsset, newCancelToken, isMounted])

  // -----------------------------------
  // 2. Attach access details to asset
  // -----------------------------------
  useEffect(() => {
    if (!isMounted) return

    fetchAccessDetails()
  }, [accountId, fetchAccessDetails, isMounted])

  // -----------------------------------
  // Check user network against asset network
  // -----------------------------------
  useEffect(() => {
    if (!chain?.id || !asset?.credentialSubject.chainId) return
    const isAssetNetwork = chain?.id === asset?.credentialSubject.chainId
    setIsAssetNetwork(isAssetNetwork)
  }, [chain?.id, asset?.credentialSubject.chainId])

  // -----------------------------------
  // Asset owner check against wallet user
  // -----------------------------------
  useEffect(() => {
    if (!accountId || !owner) return

    const isOwner = accountId?.toLowerCase() === owner.toLowerCase()
    setIsOwner(isOwner)
  }, [accountId, owner])

  // -----------------------------------
  // Load ocean config based on asset network
  // -----------------------------------
  useEffect(() => {
    if (!asset?.credentialSubject?.chainId) return
    const config = getOceanConfig(asset?.credentialSubject?.chainId)
    const oceanConfig = {
      ...config,

      // add local dev values
      ...(asset?.credentialSubject?.chainId === 8996 && {
        ...sanitizeDevelopmentConfig(config)
      })
    }
    setOceanConfig(oceanConfig)
  }, [asset?.credentialSubject?.chainId])

  // -----------------------------------
  // Set Asset State as a string
  // -----------------------------------
  useEffect(() => {
    if (!asset?.credentialSubject.nft) return

    setAssetState(assetStateToString(asset.credentialSubject.nft.state))
  }, [asset])

  return (
    <AssetContext.Provider
      value={
        {
          asset,
          did,
          title,
          owner,
          error,
          isInPurgatory,
          purgatoryData,
          loading,
          fetchAsset,
          isAssetNetwork,
          isOwner,
          oceanConfig,
          assetState
        } as AssetProviderValue
      }
    >
      {children}
    </AssetContext.Provider>
  )
}

// Helper hook to access the provider values
const useAsset = (): AssetProviderValue => useContext(AssetContext)

export { AssetProvider, useAsset, AssetContext }
export default AssetProvider
