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

// Convert article metadata to resource card format
function articleToResourceCard(article: ArticleMetadata): ResourceCard {
  // Combine all section content for search
  const combinedContent =
    article.sections
      ?.map((section) => `${section.title} ${section.content}`)
      .join(' ') || ''

  return {
    id: article.id,
    category: article.category,
    tag: article.tag,
    title: article.title,
    description: article.description,
    image: article.cardImage,
    link: `/articles/${article.slug}`,
    content: combinedContent,
    tags: article.tags
  }
}

// Load articles with full content from metadata files
async function loadAllArticles(): Promise<ResourceCard[]> {
  try {
    // First get the list of articles from the index
    const articlesIndex = await import(
      '../../content/resources/articles/index.json'
    )
    const articlesList = articlesIndex.articles || []

    // Then load the full metadata for each article
    const articlesWithContent: ResourceCard[] = []

    for (const article of articlesList) {
      try {
        const metadata = await loadArticleMetadata(article.slug)
        if (metadata && metadata.isPublished) {
          const resourceCard = articleToResourceCard(metadata)
          articlesWithContent.push(resourceCard)
        }
      } catch (error) {
        console.error(
          `Error loading metadata for article ${article.slug}:`,
          error
        )
        // Fallback to basic article data if metadata fails to load
        articlesWithContent.push(article)
      }
    }

    return articlesWithContent
  } catch (error) {
    console.error('Error loading articles:', error)
    return []
  }
}

// Load academy resources
async function loadAcademyResources(): Promise<ResourceCard[]> {
  try {
    const academyIndex = await import(
      '../../content/resources/academy/index.json'
    )
    return academyIndex.academy || []
  } catch (error) {
    console.error('Error loading academy resources:', error)
    return []
  }
}

// Load events
async function loadEvents(): Promise<ResourceCard[]> {
  try {
    const eventsIndex = await import(
      '../../content/resources/events/index.json'
    )
    return eventsIndex.events || []
  } catch (error) {
    console.error('Error loading events:', error)
    return []
  }
}

// Load guides
async function loadGuides(): Promise<ResourceCard[]> {
  try {
    const guidesIndex = await import(
      '../../content/resources/guides/index.json'
    )
    return guidesIndex.guides || []
  } catch (error) {
    console.error('Error loading guides:', error)
    return []
  }
}

// Load glossary (placeholder)
async function loadGlossary(): Promise<ResourceCard[]> {
  // TODO: Implement glossary content loading
  return []
}

// Load research papers (placeholder)
async function loadResearchPapers(): Promise<ResourceCard[]> {
  // TODO: Implement research papers loading
  return []
}

// Function to load resources by category
export async function loadResourcesByCategory(
  category: string
): Promise<ResourceCard[]> {
  switch (category) {
    case 'articles':
      return await loadAllArticles()
    case 'academy':
      return await loadAcademyResources()
    case 'events':
      return await loadEvents()
    case 'guides':
      return await loadGuides()
    case 'glossary':
      return await loadGlossary()
    case 'research':
      return await loadResearchPapers()
    default:
      return []
  }
}

export type { ArticleMetadata }
