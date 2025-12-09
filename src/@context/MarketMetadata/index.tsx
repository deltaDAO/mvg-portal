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
import { useConnect, useChainId } from 'wagmi'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
import useEnterpriseFeeColletor from '@hooks/useEnterpriseFeeCollector'
import { useEthersSigner } from '@hooks/useEthersSigner'
const MarketMetadataContext = createContext({} as MarketMetadataProviderValue)

function MarketMetadataProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { status } = useConnect()
  const isLoading = status === 'pending'
  const chainId = useChainId()
  const signer = useEthersSigner()

  const { getOpcData } = useEnterpriseFeeColletor()
  const [opcFees, setOpcFees] = useState<OpcFee[]>()
  const [approvedBaseTokens, setApprovedBaseTokens] = useState<TokenInfo[]>()
  const config = getOceanConfig(chainId)

  // ---------------------------
  // Load OPC Fee Data
  // ---------------------------
  useEffect(() => {
    async function fetchData() {
      const opcData = await getOpcData(appConfig.chainIdsSupported)
      LoggerInstance.log('[MarketMetadata] Got new data.', {
        opcFees: opcData,
        siteContent,
        appConfig
      })
      setOpcFees(opcData)
    }

    if (signer) fetchData()
  }, [signer])

  // ---------------------------
  // Get OPC fee for given token
  // ---------------------------
  const getOpcFeeForToken = useCallback(
    (tokenAddress: string, chainId: number): string => {
      if (!opcFees) return '0'
      const opc = opcFees.find((x) => x.chainId === chainId)
      return opc?.feePercentage || '0'
    },
    [opcFees]
  )

  // ---------------------------
  // Load OCEAN token metadata
  // ---------------------------
  useEffect(() => {
    async function fetchTokenInfoSafe() {
      try {
        if (isLoading) return
        if (!config?.oceanTokenAddress) {
          console.warn('[fetchTokenInfo] No oceanTokenAddress configured.')
          return
        }

        if (!chainId) {
          console.error('[fetchTokenInfo] chainId missing.')
          return
        }

        if (!signer) {
          console.warn('[fetchTokenInfo] Waiting for signer...')
          return
        }
        const tokenDetails = await getTokenInfo(
          config.oceanTokenAddress,
          signer.provider
        )

        setApprovedBaseTokens([tokenDetails])
      } catch (error: any) {
        console.error(
          '[fetchTokenInfo] Error fetching token info:',
          error.message
        )
      }
    }

    fetchTokenInfoSafe()
  }, [isLoading, chainId, signer, config?.oceanTokenAddress])

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

const useMarketMetadata = (): MarketMetadataProviderValue =>
  useContext(MarketMetadataContext)

export { MarketMetadataProvider, useMarketMetadata, MarketMetadataContext }
export default MarketMetadataProvider
