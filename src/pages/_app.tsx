'use client'
import type { AppProps } from 'next/app'
import { ReactElement } from 'react'
import { UserPreferencesProvider } from '@context/UserPreferences'
import UrqlProvider from '@context/UrqlProvider'
import ConsentProvider from '@context/CookieConsent'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import App from '../components/App'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import '../stylesGlobal/styles.css'
import Decimal from 'decimal.js'
import MarketMetadataProvider from '@context/MarketMetadata'

import { WagmiProvider } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { connectKitTheme, getWagmiClient } from '@utils/wallet'
import { FilterProvider } from '@context/Filter'
import { SsiWalletProvider } from '@context/SsiWallet'

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })

  const wagmiClient = getWagmiClient()

  if (!wagmiClient) return null

  return (
    <WagmiProvider config={wagmiClient}>
      <ConnectKitProvider
        options={{ initialChainId: 0 }}
        customTheme={connectKitTheme}
      >
        <MarketMetadataProvider>
          <UrqlProvider>
            <UserPreferencesProvider>
              <ConsentProvider>
                <SearchBarStatusProvider>
                  <FilterProvider>
                    <SsiWalletProvider>
                      <App>
                        <Component {...pageProps} />
                      </App>
                    </SsiWalletProvider>
                  </FilterProvider>
                </SearchBarStatusProvider>
              </ConsentProvider>
            </UserPreferencesProvider>
          </UrqlProvider>
        </MarketMetadataProvider>
      </ConnectKitProvider>
    </WagmiProvider>
  )
}

export default MyApp
