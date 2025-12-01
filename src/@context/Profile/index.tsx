import {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactElement,
  useCallback,
  ReactNode
} from 'react'
import { useUserPreferences } from '../UserPreferences'
import { EscrowContract, LoggerInstance } from '@oceanprotocol/lib'
import {
  getDownloadAssets,
  getPublishedAssets,
  getUserOrders,
  getUserSalesAndRevenue
} from '@utils/aquarius'
import axios, { CancelToken } from 'axios'
import { useMarketMetadata } from '../MarketMetadata'
import { formatUnits, isAddress, BrowserProvider } from 'ethers' // FIX: Ethers v6 utils and BrowserProvider
import { Asset } from 'src/@types/Asset'
import { useChainId, usePublicClient, useWalletClient } from 'wagmi' // FIX: Wagmi v2 hooks
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
import { useEthersSigner } from '@hooks/useEthersSigner'

// Assuming DownloadedAsset, TokenInfo, AccessDetails are globally available

interface ProfileProviderValue {
  assets: Asset[]
  assetsTotal: number
  isEthAddress: boolean
  downloads: DownloadedAsset[]
  downloadsTotal: number
  isDownloadsLoading: boolean
  sales: number
  ownAccount: boolean
  revenue: number
  escrowAvailableFunds: string
  escrowLockedFunds: string
  handlePageChange: (pageNumber: number) => void
  refreshEscrowFunds?: () => void
}

const ProfileContext = createContext({} as ProfileProviderValue)

const refreshInterval = 10000 // 10 sec.

function ProfileProvider({
  accountId,
  ownAccount,
  children
}: {
  accountId: string
  ownAccount: boolean
  children: ReactNode
}): ReactElement {
  const walletClient = useEthersSigner() // FIX: Replaced useSigner
  const chainId = useChainId() // FIX: Replaced useNetwork
  const { chainIds } = useUserPreferences()
  const { appConfig } = useMarketMetadata()
  const [revenue, setRevenue] = useState(0)
  const [escrowAvailableFunds, setEscrowAvailableFunds] = useState('0')
  const [escrowLockedFunds, setEscrowLockedFunds] = useState('0')
  const viemPublicClient = usePublicClient({ chainId }) // Original: useProvider

  // FIX: Convert Viem Public Client transport to Ethers Provider
  const web3provider = viemPublicClient
    ? new BrowserProvider(
        // viem client exposes transport with a request method compatible with EIP-1193
        {
          request: viemPublicClient.request.bind(viemPublicClient)
        } as any
      )
    : undefined

  const [isEthAddress, setIsEthAddress] = useState<boolean>()
  //
  // Do nothing in all following effects
  // when accountId is no ETH address
  //
  useEffect(() => {
    const isEthAddress = isAddress(accountId)
    setIsEthAddress(isEthAddress)
  }, [accountId])

  //
  // PUBLISHED ASSETS
  //
  const [assets, setAssets] = useState<Asset[]>()
  const [assetsTotal, setAssetsTotal] = useState(0)
  // const [assetsWithPrices, setAssetsWithPrices] = useState<AssetListPrices[]>()

  useEffect(() => {
    if (!accountId || !isEthAddress) return

    const cancelTokenSource = axios.CancelToken.source()

    async function getAllPublished() {
      try {
        const result = await getPublishedAssets(
          accountId,
          chainIds,
          cancelTokenSource.token,
          ownAccount,
          ownAccount
        )
        setAssets(result.results)
        setAssetsTotal(result.totalResults)

        // Hint: this would only make sense if we "search" in all subcomponents
        // against this provider's state, meaning filtering via js rather then sending
        // more queries to Aquarius.
        // const assetsWithPrices = await getAssetsBestPrices(result.results)
        // setAssetsWithPrices(assetsWithPrices)
      } catch (error: any) {
        LoggerInstance.error(error.message)
      }
    }
    getAllPublished()

    return () => {
      cancelTokenSource.cancel()
    }
  }, [
    accountId,
    appConfig.metadataCacheUri,
    chainIds,
    isEthAddress,
    ownAccount
  ])

  //
  // DOWNLOADS
  //
  const [downloads, setDownloads] = useState<DownloadedAsset[]>()
  const [downloadsTotal, setDownloadsTotal] = useState(0)
  const [isDownloadsLoading, setIsDownloadsLoading] = useState<boolean>()
  const [downloadsInterval, setDownloadsInterval] = useState<NodeJS.Timeout>()
  const [currentPage, setCurrentPage] = useState(1)

  const fetchDownloads = useCallback(
    async (cancelToken: CancelToken, page = 1) => {
      if (!accountId || !chainIds) return

      const dtList: string[] = []
      let currentPage = 1
      let totalPages = 1

      // Fetch all pages of user orders
      while (currentPage <= totalPages) {
        const orders = await getUserOrders(accountId, cancelToken, currentPage)
        orders?.results?.forEach((order) => {
          if (order.datatokenAddress) dtList.push(order.datatokenAddress)
        })
        // eslint-disable-next-line prefer-destructuring
        totalPages = orders?.totalPages || 0
        currentPage++
      }

      const result = await getDownloadAssets(
        dtList,
        chainIds,
        cancelToken,
        ownAccount,
        page // Only paginate here
      )
      // Paginate only the download assets
      const downloadedAssets = result?.downloadedAssets || []
      const totalResults = result?.totalResults || 0

      setDownloads(downloadedAssets)
      setDownloadsTotal(totalResults)
    },
    [accountId, chainIds, ownAccount]
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    const cancelToken = axios.CancelToken.source()
    fetchDownloads(cancelToken.token, currentPage)

    return () => cancelToken.cancel('Request cancelled.')
  }, [currentPage, fetchDownloads])

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source()

    async function getDownloadAssets() {
      if (!appConfig?.metadataCacheUri) return

      try {
        setIsDownloadsLoading(true)
        await fetchDownloads(cancelTokenSource.token)
      } catch (err: any) {
        LoggerInstance.log(err.message)
      } finally {
        setIsDownloadsLoading(false)
      }
    }
    getDownloadAssets()

    if (downloadsInterval) return
    const interval = setInterval(async () => {
      await fetchDownloads(cancelTokenSource.token)
    }, refreshInterval)
    setDownloadsInterval(interval)

    return () => {
      cancelTokenSource.cancel()
      clearInterval(downloadsInterval)
    }
  }, [fetchDownloads, appConfig.metadataCacheUri, downloadsInterval])

  //
  // SALES NUMBER
  //
  const [sales, setSales] = useState(0)

  useEffect(() => {
    if (!accountId || chainIds.length === 0) {
      setSales(0)
      return
    }
    async function getUserSalesNumber() {
      try {
        const { totalOrders, totalRevenue } = await getUserSalesAndRevenue(
          accountId,
          chainIds
        )
        setRevenue(totalRevenue)
        setSales(totalOrders)
      } catch (error: any) {
        LoggerInstance.error(error.message)
      }
    }
    getUserSalesNumber()
  }, [accountId, chainIds])

  async function getEscrowFunds() {
    if (!accountId || !isEthAddress || !web3provider || !chainId) {
      setEscrowAvailableFunds('0')
      setEscrowLockedFunds('0')
      return
    }

    try {
      const { oceanTokenAddress, escrowAddress } = getOceanConfig(chainId)

      const escrow = new EscrowContract(
        escrowAddress,
        web3provider as any,
        chainId
      )

      const funds = await escrow.getUserFunds(accountId, oceanTokenAddress)

      const tokenDetails = await getTokenInfo(
        oceanTokenAddress,
        web3provider as any
      )

      const availableFunds = formatUnits(funds.available, tokenDetails.decimals)
      const lockedFunds = formatUnits(funds.locked, tokenDetails.decimals)

      setEscrowLockedFunds(lockedFunds)
      setEscrowAvailableFunds(availableFunds)
    } catch (error: any) {
      LoggerInstance.error(error.message)
    }
  }

  useEffect(() => {
    getEscrowFunds()
  }, [accountId, web3provider, isEthAddress, chainId])

  useEffect(() => {
    // FIX: Update dependencies to use new variables
    getEscrowFunds()
  }, [accountId, walletClient, isEthAddress, chainId])

  return (
    <ProfileContext.Provider
      value={{
        assets,
        assetsTotal,
        isEthAddress,
        downloads,
        downloadsTotal,
        isDownloadsLoading,
        handlePageChange,
        ownAccount,
        sales,
        revenue,
        escrowAvailableFunds,
        escrowLockedFunds,
        refreshEscrowFunds: getEscrowFunds
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

// Helper hook to access the provider values
const useProfile = (): ProfileProviderValue => useContext(ProfileContext)

export { ProfileProvider, useProfile, ProfileContext }
export default ProfileProvider
