import ConsentProvider from '@context/CookieConsent'
import { FilterProvider } from '@context/Filter'
import MarketMetadataProvider from '@context/MarketMetadata'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import UrqlProvider from '@context/UrqlProvider'
import { UserPreferencesProvider } from '@context/UserPreferences'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { connectKitTheme, wagmiClient } from '@utils/wallet'
import { plausibleDataDomain } from 'app.config'
import { ConnectKitProvider } from 'connectkit'
import Decimal from 'decimal.js'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { ReactElement } from 'react'
import { WagmiConfig } from 'wagmi'
import App from '../../src/components/App'
import AutomationProvider from '../@context/Automation/AutomationProvider'
import '../stylesGlobal/styles.css'
import { QueryClientLoadingIndicator } from '@components/@shared/QueryClientLoadingIndicator'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 0
    }
  }
})

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })

  return (
    <>
      {plausibleDataDomain && (
        <Script
          data-domain={plausibleDataDomain}
          src="https://plausible.io/js/script.js"
        />
      )}
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          options={{ initialChainId: 0 }}
          customTheme={connectKitTheme}
        >
          <MarketMetadataProvider>
            <UrqlProvider>
              <UserPreferencesProvider>
                <AutomationProvider>
                  <ConsentProvider>
                    <SearchBarStatusProvider>
                      <FilterProvider>
                        <QueryClientProvider client={queryClient}>
                          <QueryClientLoadingIndicator />
                          <QueryClientProvider client={queryClient}>
                            <App>
                              <Component {...pageProps} />
                            </App>
                          </QueryClientProvider>
                        </QueryClientProvider>
                      </FilterProvider>
                    </SearchBarStatusProvider>
                  </ConsentProvider>
                </AutomationProvider>
              </UserPreferencesProvider>
            </UrqlProvider>
          </MarketMetadataProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  )
}

export default MyApp
