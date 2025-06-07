import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Page from '@shared/Page'
import DynamicArticle from '../../components/Article/DynamicArticle'
import { useMarketMetadata } from '@context/MarketMetadata'
import webEvolutionArticle from '../../../content/resources/articles/web-evolution/metadata.json'

export default function ArticlePage(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const router = useRouter()
  const { slug } = router.query

  // For now, hardcode to web-evolution article
  // In the future, you can expand this with a mapping object
  const article = slug === 'web-evolution' ? webEvolutionArticle : null

  if (!article) {
    return (
      <Page
        title="Article Not Found"
        description="The requested article could not be found."
        uri={router.asPath}
        noPageHeader
      >
        <div className="py-16 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Article Not Found
          </h1>
          <p className="text-gray-500 text-lg">
            The requested article could not be found.
          </p>
        </div>
      </Page>
    )
  }

  return (
    <Page
      title={article.title}
      description={article.description}
      uri={router.asPath}
      noPageHeader
    >
      <DynamicArticle article={article} />
    </Page>
  )
}
