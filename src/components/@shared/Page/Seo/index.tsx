import { ReactElement } from 'react'
import Head from 'next/head'

import { useMarketMetadata } from '@context/MarketMetadata'
import { DatasetSchema } from './DatasetSchema'

export default function Seo({
  title,
  description,
  uri
}: {
  title?: string
  description?: string
  uri: string
}): ReactElement {
  const { siteContent } = useMarketMetadata()

  // Remove trailing slash from all URLs
  const canonical = `${siteContent?.siteUrl}${uri}`.replace(/\/$/, '')

  const pageTitle =
    uri === '/'
      ? siteContent?.siteTitle
      : title
      ? `${title} - ${siteContent?.siteTitle}`
      : `${siteContent?.siteTitle} — ${siteContent?.siteTagline}`

  const datasetSchema = DatasetSchema()

  return (
    <Head>
      <title>{pageTitle}</title>

      {/* Derive environment from configured siteUrl to avoid window usage */}
      {(() => {
        let isProd = false
        try {
          const host = new URL(siteContent?.siteUrl || '').hostname
          isProd = host === 'portal.pontus-x.eu'
        } catch {
          isProd = false
        }
        return !isProd ? (
          <meta name="robots" content="noindex,nofollow" />
        ) : null
      })()}

      <link rel="canonical" href={canonical} />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="var(--background-content)" />

      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />

      <meta
        name="image"
        content={`${siteContent?.siteUrl}${siteContent?.siteImage}`}
      />
      <meta
        property="og:image"
        content={`${siteContent?.siteUrl}${siteContent?.siteImage}`}
      />

      <meta property="og:site_name" content={siteContent?.siteTitle} />
      {(() => {
        try {
          const host = new URL(siteContent?.siteUrl || '').hostname
          return host === 'portal.pontus-x.eu' ? (
            <meta name="twitter:creator" content="@deltaDAO" />
          ) : null
        } catch {
          return null
        }
      })()}
      <meta name="twitter:card" content="summary_large_image" />

      {datasetSchema && (
        <script type="application/ld+json" id="datasetSchema">
          {JSON.stringify(datasetSchema).replace(/</g, '\\u003c')}
        </script>
      )}
    </Head>
  )
}
