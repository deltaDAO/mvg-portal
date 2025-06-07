import { ResourceCard } from '@/components/Resources/types'

interface ArticleMetadata {
  id: string
  slug: string
  category: string
  tag: string
  title: string
  description: string
  author: string
  publishDate: string
  readTime: string
  heroImage: string
  cardImage: string
  isPublished: boolean
  tags: string[]
  sections: Array<{
    title: string
    content: string
  }>
  quote: string
  finalParagraph: string
  furtherReading: Array<{
    source: string
    title: string
    url: string
  }>
}

// Function to load article metadata
export async function loadArticleMetadata(
  slug: string
): Promise<ArticleMetadata | null> {
  try {
    // In a real app, this would be a server-side function or API call
    // For now, we'll simulate loading from the file system
    const response = await fetch(
      `/content/resources/articles/${slug}/metadata.json`
    )
    if (!response.ok) {
      return null
    }
    const metadata: ArticleMetadata = await response.json()
    return metadata
  } catch (error) {
    console.error(`Error loading article metadata for ${slug}:`, error)
    return null
  }
}

// Function to load all published articles
export async function loadAllArticles(): Promise<ResourceCard[]> {
  try {
    // For now, we'll hardcode the articles list
    // In a real implementation, this would scan the articles directory
    const articleSlugs = ['web-evolution']

    const articles: ResourceCard[] = []

    for (const slug of articleSlugs) {
      const metadata = await loadArticleMetadata(slug)
      if (metadata && metadata.isPublished) {
        articles.push({
          id: metadata.id,
          category: metadata.category,
          tag: metadata.tag,
          title: metadata.title,
          description: metadata.description,
          image: `/content/resources/articles/${slug}/${metadata.cardImage}`,
          link: `/articles/${slug}`
        })
      }
    }

    return articles
  } catch (error) {
    console.error('Error loading articles:', error)
    return []
  }
}

// Function to load resources by category
export async function loadResourcesByCategory(
  category: string
): Promise<ResourceCard[]> {
  switch (category) {
    case 'articles':
      return await loadAllArticles()
    case 'academy':
      // TODO: Implement academy content loading
      return []
    case 'events':
      // TODO: Implement events content loading
      return []
    case 'guides':
      // TODO: Implement guides content loading
      return []
    case 'glossary':
      // TODO: Implement glossary content loading
      return []
    case 'research':
      // TODO: Implement research papers loading
      return []
    default:
      return []
  }
}

export type { ArticleMetadata }
