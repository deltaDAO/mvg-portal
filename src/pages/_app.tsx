import React, { ReactElement, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { UserPreferencesProvider } from '@context/UserPreferences'
import UrqlProvider from '@context/UrqlProvider'
import ConsentProvider from '@context/CookieConsent'
import { SearchBarStatusProvider } from '@context/SearchBarStatus'
import App from '../../src/components/App'
import { OrbisProvider } from '@context/DirectMessages'
import '@oceanprotocol/typographies/css/ocean-typo.css'
import '../stylesGlobal/styles.css'
import Decimal from 'decimal.js'
import MarketMetadataProvider from '@context/MarketMetadata'
import { WagmiConfig } from 'wagmi'
import { ConnectKitProvider } from 'connectkit'
import { connectKitTheme, wagmiClient } from '@utils/wallet'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useRouter } from 'next/router'

// Check that PostHog is client-side (used to handle Next.js SSR)
// if (typeof window !== 'undefined') {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
//     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
//     persistence: 'memory'
//   })
// }

function MyApp({ Component, pageProps }: AppProps): ReactElement {
  Decimal.set({ rounding: 1 })
  // const router = useRouter()

  // useEffect(() => {
  //   // Track page views
  //   const handleRouteChange = () => posthog?.capture('$pageview')
  //   router.events.on('routeChangeComplete', handleRouteChange)

  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange)
  //   }
  // }, [router.events])

  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <ConnectKitProvider
          options={{ initialChainId: 0 }}
          customTheme={connectKitTheme}
        >
          <MarketMetadataProvider>
            <UrqlProvider>
              <UserPreferencesProvider>
                <ConsentProvider>
                  <SearchBarStatusProvider>
                    {/* <OrbisProvider> */}
                    {/* <PostHogProvider client={posthog}> */}
                    <App>
                      <Component {...pageProps} />
                    </App>
                    {/* </PostHogProvider> */}
                    {/* </OrbisProvider> */}
                  </SearchBarStatusProvider>
                </ConsentProvider>
              </UserPreferencesProvider>
            </UrqlProvider>
          </MarketMetadataProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  )
}

export default MyApp
