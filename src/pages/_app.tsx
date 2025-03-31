import { ReactElement } from 'react'
import type { AppProps } from 'next/app'
import { UserPreferencesProvider } from '@context/UserPreferences'
import UrqlProvider from '@context/UrqlProvider'
import ConsentProvider from '@context/CookieConsent'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import App from '../../src/components/App'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import '../stylesGlobal/styles.css'
import Decimal from 'decimal.js'
import MarketMetadataProvider from '@context/MarketMetadata'
import AutomationProvider from '../@context/Automation/AutomationProvider'
import { FilterProvider } from '@context/Filter'
import WagmiClientProvider from '@context/WagmiClient'

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })

  return (
    <>
      <WagmiClientProvider>
        <MarketMetadataProvider>
          <UrqlProvider>
            <UserPreferencesProvider>
              <AutomationProvider>
                <ConsentProvider>
                  <SearchBarStatusProvider>
                    <FilterProvider>
                      <App>
                        <Component {...pageProps} />
                      </App>
                    </FilterProvider>
                  </SearchBarStatusProvider>
                </ConsentProvider>
              </AutomationProvider>
            </UserPreferencesProvider>
          </UrqlProvider>
        </MarketMetadataProvider>
      </WagmiClientProvider>
    </>
  )
}

export default MyApp
