import { connectKitTheme, wagmiClient } from '@utils/wallet'
import { getSupportedChains } from '@utils/wallet/chains'
import { chainIdsSupported } from 'app.config'
import { ConnectKitProvider } from 'connectkit'
import {
  useContext,
  useState,
  createContext,
  useEffect,
  ReactNode,
  ReactElement
} from 'react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { getLocalStorage } from './UserPreferences'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

interface WagmiClientProviderValue {
  wagmiClient2: any
  isWagmiAllowed: boolean
  setIsWagmiAllowed: (value: boolean) => void
}

const WagmiClientContext = createContext({} as WagmiClientProviderValue)

function WagmiClientProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [isWagmiAllowed, setIsWagmiAllowed] = useState(
    getLocalStorage()?.isWagmiAllowed || false
  )

  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

  const createDefaultClient = () => {
    const supportedChains = getSupportedChains(chainIdsSupported)

    const providers = [publicProvider()]

    const { chains, provider, webSocketProvider } = configureChains(
      supportedChains,
      providers
    )

    const connectors = []

    if (isWagmiAllowed) {
      if (walletConnectProjectId) {
        connectors.push(
          new WalletConnectConnector({
            chains,
            options: {
              projectId: walletConnectProjectId,
              showQrModal: true
            }
          })
        )
      }

      connectors.push(
        new CoinbaseWalletConnector({
          chains,
          options: {
            appName: 'Pontus-X'
          }
        })
      )

      connectors.push(
        new MetaMaskConnector({
          chains,
          options: {
            shimDisconnect: true
          }
        })
      )

      connectors.push(
        new InjectedConnector({
          chains,
          options: {
            name: 'Browser Wallet',
            shimDisconnect: true
          }
        })
      )
    }
    return createClient({
      autoConnect: isWagmiAllowed,
      connectors,
      provider,
      webSocketProvider
    })
  }

  // Use state to store the client, initialized with our default client
  const [wagmiClient2, setWagmiClient] = useState<any>(null)

  useEffect(() => {
    const client = createDefaultClient()
    setWagmiClient(client)

    if (!isWagmiAllowed) {
      localStorage.removeItem('walletconnect')
      localStorage.removeItem('wagmi.store')
      localStorage.removeItem('wagmi.cache')
    }
  }, [isWagmiAllowed, walletConnectProjectId])

  // Don't render until client is ready
  if (!wagmiClient2) {
    return <></>
  }

  return (
    <WagmiClientContext.Provider
      value={{
        wagmiClient2,
        isWagmiAllowed,
        setIsWagmiAllowed
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          options={{
            initialChainId: 0
          }}
          customTheme={connectKitTheme}
        >
          {children}
        </ConnectKitProvider>
      </WagmiConfig>
    </WagmiClientContext.Provider>
  )
}

const useWagmiClient = (): WagmiClientProviderValue =>
  useContext(WagmiClientContext)

export { WagmiClientProvider, useWagmiClient, WagmiClientContext }
export default WagmiClientProvider
