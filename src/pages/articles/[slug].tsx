import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Page from '@shared/Page'
import ArticleContent from '../../components/Article/ArticleContent'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useShowNewsletterBanner } from '../../@hooks/useShowNewsletterBanner'

export default function ArticlePage(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const router = useRouter()
  const { slug } = router.query

  useShowNewsletterBanner()

  return (
    <Page
      title="Web1.0 to Web3.0: Evolutions of the Internet"
      description="Explore the historical transformation of the internet—from static Web1.0 to decentralized Web3.0."
      uri={router.asPath}
      noPageHeader
    >
      <ArticleContent slug={slug as string} />
    </Page>
  )
}
