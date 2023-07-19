import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  useCallback,
  ReactNode
} from 'react'
import { Config, LoggerInstance, Purgatory } from '@oceanprotocol/lib'
import { CancelToken } from 'axios'
import { getAsset } from '@utils/aquarius'
import { useWeb3 } from './Web3'
import { useCancelToken } from '@hooks/useCancelToken'
import { getOceanConfig, getDevelopmentConfig } from '@utils/ocean'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { useIsMounted } from '@hooks/useIsMounted'
import { useMarketMetadata } from './MarketMetadata'
import { assetStateToString } from '@utils/assetState'
import { isValidDid } from '@utils/ddo'
import { useAddressConfig } from '@hooks/useAddressConfig'
import {
  getPublisherFromServiceCredential,
  getServiceCredential,
  verifyRawServiceCredential
} from '@components/Publish/_utils'

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
  isVerifyingServiceCredential: boolean
  isServiceCredentialVerified: boolean
  serviceCredentialIdMatch?: boolean
  serviceCredentialVersion: string
  verifiedServiceProviderName: string
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

  const { chainId, accountId } = useWeb3()
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
  const [isVerifyingServiceCredential, setIsVerifyingServiceCredential] =
    useState(false)
  const [isServiceCredentialVerified, setIsServiceCredentialVerified] =
    useState<boolean>()
  const [serviceCredentialIdMatch, setServiceCredentialIdMatch] =
    useState<boolean>()
  const [serviceCredentialVersion, setServiceCredentialVersion] =
    useState<string>()
  const [verifiedServiceProviderName, setVerifiedServiceProviderName] =
    useState<string>()

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
      const asset = await getAsset(did, token)
      const isWhitelisted = isDDOWhitelisted(asset)

      if (!asset) {
        setError(
          `\`${did}\`` +
            '\n\nWe could not find an asset for this DID in the cache. If you just published a new asset, wait some seconds and refresh this page.'
        )
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }

      if (!isWhitelisted) {
        setError(
          `\`${did}\`` + '\n\nThis DID can not be retrieved on this portal.'
        )
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }

      if (asset.nft.state === (1 | 2 | 3)) {
        setTitle(
          `This asset has been set as "${assetStateToString(
            asset.nft.state
          )}" by the publisher`
        )
        setError(`\`${did}\`` + `\n\nPublisher Address: ${asset.nft.owner}`)
        LoggerInstance.error(`[asset] Failed getting asset for ${did}`, asset)
        return
      }
      if (asset) {
        setError(undefined)
        setAsset((prevState) => ({
          ...prevState,
          ...asset
        }))
        setTitle(asset.metadata?.name)
        setOwner(asset.nft?.owner)
        setIsInPurgatory(asset.purgatory?.state)
        setPurgatoryData(asset.purgatory)
        setAssetState(assetStateToString(asset.nft.state))
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
    if (!asset?.chainId || !asset?.services?.length) return

    const accessDetails = await getAccessDetails(
      asset.chainId,
      asset.services[0].datatokenAddress,
      asset.services[0].timeout,
      accountId
    )
    setAsset((prevState) => ({
      ...prevState,
      accessDetails
    }))
    LoggerInstance.log(`[asset] Got access details for ${did}`, accessDetails)
  }, [asset?.chainId, asset?.services, accountId, did])

  // -----------------------------------
  // Helper: Get and set asset Service Credential state
  // -----------------------------------
  const checkServiceCredential = useCallback(
    async (asset: AssetExtended): Promise<void> => {
      if (!asset) return
      setIsVerifyingServiceCredential(true)

      try {
        const { additionalInformation } = asset.metadata
        const serviceCredential =
          additionalInformation?.gaiaXInformation?.serviceSD

        if (!serviceCredential || !Object.keys(serviceCredential)?.length) {
          setIsServiceCredentialVerified(false)
          setServiceCredentialIdMatch(false)
          setServiceCredentialVersion(undefined)
          setVerifiedServiceProviderName(undefined)
          return
        }

        const serviceCredentialContent = serviceCredential?.url
          ? await getServiceCredential(serviceCredential?.url)
          : serviceCredential?.raw

        const { verified, complianceApiVersion, idMatch } =
          await verifyRawServiceCredential(serviceCredentialContent, asset.id)

        setIsServiceCredentialVerified(verified && !!serviceCredentialContent)
        setServiceCredentialIdMatch(
          verified && !!serviceCredentialContent && idMatch
        )
        setServiceCredentialVersion(complianceApiVersion)
        const serviceProviderName = getPublisherFromServiceCredential(
          serviceCredentialContent
        )
        setVerifiedServiceProviderName(serviceProviderName)
      } catch (error) {
        setIsServiceCredentialVerified(false)
        setServiceCredentialIdMatch(false)
        setServiceCredentialVersion(undefined)
        setVerifiedServiceProviderName(undefined)
        LoggerInstance.error(error)
      } finally {
        setIsVerifyingServiceCredential(false)
      }
    },
    []
  )

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
    if (!chainId || !asset?.chainId) return

    const isAssetNetwork = chainId === asset?.chainId
    setIsAssetNetwork(isAssetNetwork)
  }, [chainId, asset?.chainId])

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
    if (!asset?.chainId) return

    const oceanConfig = {
      ...getOceanConfig(asset?.chainId),

      // add local dev values
      ...(asset?.chainId === 8996 && {
        ...getDevelopmentConfig()
      })
    }
    setOceanConfig(oceanConfig)
  }, [asset?.chainId])

  // -----------------------------------
  // Set Asset State as a string
  // -----------------------------------
  useEffect(() => {
    if (!asset?.nft) return

    setAssetState(assetStateToString(asset.nft.state))
  }, [asset])

  // -----------------------------------
  // Set Asset Service Credential state
  // -----------------------------------
  useEffect(() => {
    if (!asset) return

    checkServiceCredential(asset)
  }, [asset, checkServiceCredential])

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
          assetState,
          isVerifyingServiceCredential,
          isServiceCredentialVerified,
          serviceCredentialIdMatch,
          serviceCredentialVersion,
          verifiedServiceProviderName
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
