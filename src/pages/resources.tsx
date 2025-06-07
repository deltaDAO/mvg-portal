import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Page from '@shared/Page'
import Resources from '@components/Resources'
import { useMarketMetadata } from '@context/MarketMetadata'
import articlesIndex from '../../content/resources/articles/index.json'

export default function PageResources(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const router = useRouter()

  return (
    <Page
      title="Resources - The Reading Room"
      description="Your go-to hub for valuable resources and everything you need to get the most out of Clio-X."
      uri={router.route}
      noPageHeader
    >
      <Resources initialArticles={articlesIndex.articles} />
    </Page>
  )
}
