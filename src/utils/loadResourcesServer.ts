import fs from 'fs'
import path from 'path'
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

// Get all article slugs by scanning the content directory
export function getAllArticleSlugs(): string[] {
  const articlesDir = path.join(
    process.cwd(),
    'content',
    'resources',
    'articles'
  )

  try {
    if (!fs.existsSync(articlesDir)) {
      return []
    }

    return fs
      .readdirSync(articlesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
  } catch (error) {
    console.error('Error reading articles directory:', error)
    return []
  }
}

// Load article metadata from server-side file system
export function loadArticleMetadataServer(
  slug: string
): ArticleMetadata | null {
  try {
    const metadataPath = path.join(
      process.cwd(),
      'content',
      'resources',
      'articles',
      slug,
      'metadata.json'
    )

    if (!fs.existsSync(metadataPath)) {
      return null
    }

    const fileContents = fs.readFileSync(metadataPath, 'utf8')
    const metadata: ArticleMetadata = JSON.parse(fileContents)
    return metadata
  } catch (error) {
    console.error(`Error loading article metadata for ${slug}:`, error)
    return null
  }
}

// Load all published articles for server-side rendering
export function loadAllArticlesServer(): ResourceCard[] {
  const articleSlugs = getAllArticleSlugs()
  const articles: ResourceCard[] = []

  for (const slug of articleSlugs) {
    const metadata = loadArticleMetadataServer(slug)
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
}

// Load resources by category for server-side rendering
export function loadResourcesByCategoryServer(
  category: string
): ResourceCard[] {
  switch (category) {
    case 'articles':
      return loadAllArticlesServer()
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
