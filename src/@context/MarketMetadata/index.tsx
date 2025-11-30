import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { MarketMetadataProviderValue, OpcFee } from './_types'
import siteContent from '../../../content/site.json'
import appConfig from '../../../app.config.cjs'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useConnect, useChainId, usePublicClient } from 'wagmi'
import { BrowserProvider } from 'ethers'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
import useEnterpriseFeeColletor from '@hooks/useEnterpriseFeeCollector'
const MarketMetadataContext = createContext({} as MarketMetadataProviderValue)

function MarketMetadataProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { status } = useConnect()
  const isLoading = status === 'pending'
  const chainId = useChainId()
  const viemPublicClient = usePublicClient({ chainId })
  const web3provider = viemPublicClient
    ? new BrowserProvider({
        request: viemPublicClient.request.bind(viemPublicClient)
      } as any)
    : undefined

  const { signer, getOpcData } = useEnterpriseFeeColletor()
  const [opcFees, setOpcFees] = useState<OpcFee[]>()
  const [approvedBaseTokens, setApprovedBaseTokens] = useState<TokenInfo[]>()
  const config = getOceanConfig(chainId)

  useEffect(() => {
    async function getData() {
      const opcData = await getOpcData(appConfig.chainIdsSupported)
      LoggerInstance.log('[MarketMetadata] Got new data.', {
        opcFees: opcData,
        siteContent,
        appConfig
      })
      setOpcFees(opcData)
    }
    if (signer) {
      getData()
    }
  }, [signer])

  const getOpcFeeForToken = useCallback(
    (tokenAddress: string, chainId: number): string => {
      if (!opcFees) return '0'

      const opc = opcFees.filter((x) => x.chainId === chainId)[0]
      return opc.feePercentage
    },
    [opcFees]
  )

  useEffect(() => {
    async function fetchTokenInfo() {
      try {
        if (isLoading) return
        if (!config?.oceanTokenAddress) {
          console.warn('[fetchTokenInfo] No oceanTokenAddress configured.')
          return
        }
        if (!web3provider) {
          console.warn('[fetchTokenInfo] web3provider is not initialized yet.')
          return
        }

        const network = await web3provider.getNetwork()
        if (!network?.chainId) {
          console.error(
            '[fetchTokenInfo] Unable to determine chainId from provider.'
          )
          return
        }
        const chainId = Number(network.chainId)
        console.log('[fetchTokenInfo] chainId:', chainId, 'network:', network)

        const tokenDetails = await getTokenInfo(
          config.oceanTokenAddress,
          web3provider as any
        )
        console.log('[fetchTokenInfo] tokenDetails:', tokenDetails)

        setApprovedBaseTokens((prevTokens = []) => {
          const hasToken = prevTokens.some(
            (token) => token.address === tokenDetails.address
          )
          return hasToken ? prevTokens : [...prevTokens, tokenDetails]
        })
      } catch (error: any) {
        console.error(
          '[fetchTokenInfo] Error fetching token info:',
          error.message
        )
      }
    }

    fetchTokenInfo()
  }, [isLoading, config?.oceanTokenAddress, web3provider])

  return (
    <MarketMetadataContext.Provider
      value={
        {
          opcFees,
          siteContent,
          appConfig,
          getOpcFeeForToken,
          approvedBaseTokens
        } as MarketMetadataProviderValue
      }
    >
      {children}
    </MarketMetadataContext.Provider>
  )
}

// Helper hook to access the provider values
const useMarketMetadata = (): MarketMetadataProviderValue =>
  useContext(MarketMetadataContext)

export { MarketMetadataProvider, useMarketMetadata, MarketMetadataContext }
export default MarketMetadataProvider
