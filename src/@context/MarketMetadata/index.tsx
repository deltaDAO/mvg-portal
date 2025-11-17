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
import { useConnect, useNetwork, useProvider } from 'wagmi'
import useFactoryRouter from '@hooks/useRouter'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
const MarketMetadataContext = createContext({} as MarketMetadataProviderValue)

function MarketMetadataProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { isLoading } = useConnect()
  const { chain } = useNetwork()
  const { signer, getOpcData } = useFactoryRouter()
  const [opcFees, setOpcFees] = useState<OpcFee[]>()
  const [approvedBaseTokens, setApprovedBaseTokens] = useState<TokenInfo[]>()
  const config = getOceanConfig(chain?.id)
  const web3provider = useProvider()

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
      const isTokenApproved = opc.approvedTokens.includes(tokenAddress)
      return isTokenApproved ? opc.swapApprovedFee : opc.swapNotApprovedFee
    },
    [opcFees]
  )

  useEffect(() => {
    async function fetchTokenInfo() {
      if (isLoading || !config?.oceanTokenAddress || !web3provider) return

      const tokenDetails = await getTokenInfo(
        config.oceanTokenAddress,
        web3provider
      )

      setApprovedBaseTokens((prevTokens = []) => {
        const hasToken = prevTokens.some(
          (token) => token.address === tokenDetails.address
        )
        return hasToken ? prevTokens : [...prevTokens, tokenDetails]
      })
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
