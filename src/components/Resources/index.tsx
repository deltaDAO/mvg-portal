import { ReactElement, useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/router'
import SearchIcon from '@images/search.svg'
import { ResourceCard, Tab } from './types'
import { loadResourcesByCategory } from '@/utils/loadResources'

const tabs: Tab[] = [
  { id: 'articles', label: 'Resource Articles' },
  { id: 'academy', label: 'Clio-X Academy' },
  { id: 'events', label: 'Events' },
  { id: 'guides', label: 'Guides' },
  { id: 'glossary', label: 'Glossary' },
  { id: 'research', label: 'Research Papers' }
]

interface ResourcesProps {
  initialArticles?: ResourceCard[]
}

export default function Resources({
  initialArticles = []
}: ResourcesProps): ReactElement {
  const [activeTab, setActiveTab] = useState('articles')
  const [searchQuery, setSearchQuery] = useState('')
  const [resourceCards, setResourceCards] =
    useState<ResourceCard[]>(initialArticles)
  const [allResourceCards, setAllResourceCards] = useState<ResourceCard[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push('/').then(() => {
      // Small delay to ensure page has loaded
      setTimeout(() => {
        const contactSection = document.querySelector('#contact')
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    })
  }

  // Load all resources for search functionality
  useEffect(() => {
    const loadAllResources = async () => {
      try {
        const allResources: ResourceCard[] = []

        // Always load articles from metadata files to get full content
        const articles = await loadResourcesByCategory('articles')
        allResources.push(...articles)

        // Load other resource types
        for (const tab of tabs.filter((t) => t.id !== 'articles')) {
          const resources = await loadResourcesByCategory(tab.id)
          allResources.push(...resources)
        }

        setAllResourceCards(allResources)
      } catch (error) {
        console.error('Error loading all resources:', error)
      }
    }

    loadAllResources()
  }, [initialArticles])

  // Load resources when active tab changes
  useEffect(() => {
    const loadResources = async () => {
      // If we have initial articles and we're on the articles tab, use them
      if (activeTab === 'articles' && initialArticles.length > 0) {
        setResourceCards(initialArticles)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const resources = await loadResourcesByCategory(activeTab)
        setResourceCards(resources)
      } catch (error) {
        console.error('Error loading resources:', error)
        setResourceCards([])
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [activeTab, initialArticles])

  const filteredCards = useMemo(() => {
    // If there's a search query, search across all resources
    if (searchQuery.trim() !== '') {
      const searchTerm = searchQuery.toLowerCase()
      return allResourceCards.filter(
        (card) =>
          card.title.toLowerCase().includes(searchTerm) ||
          card.description.toLowerCase().includes(searchTerm) ||
          card.tag.toLowerCase().includes(searchTerm) ||
          // Search through article content
          (card.content && card.content.toLowerCase().includes(searchTerm)) ||
          // Search through tags array
          (card.tags &&
            card.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
      )
    }

    // Otherwise, filter by current tab
    return resourceCards.filter((card) => card.category === activeTab)
  }, [resourceCards, allResourceCards, activeTab, searchQuery])

  // Show search results count when searching
  const searchResultsText = useMemo(() => {
    if (searchQuery.trim() === '') return null

    const count = filteredCards.length
    if (count === 0) return `No results found for "${searchQuery}"`
    if (count === 1) return `1 result found for "${searchQuery}"`
    return `${count} results found for "${searchQuery}"`
  }, [filteredCards.length, searchQuery])

  return (
    <div className="bg-white -mb-16">
      {/* Hero Section */}
      <section className="py-16">
        <div className="flex flex-wrap gap-10 items-center justify-center">
          <div className="flex-1 min-w-[280px]">
            <h1 className="text-4xl md:text-5xl font-bold mb-5 text-black">
              The Reading Room
            </h1>
            <p className="max-w-2xl text-lg text-gray-600 leading-relaxed">
              Welcome to your go-to hub for valuable resources and everything
              you need to get the most out of Clio-X. If you don&apos;t see what
              you need, feel free to{' '}
              <a
                href="/#contact"
                onClick={handleContactClick}
                className="text-amber-700 underline hover:text-amber-800"
              >
                get in touch
              </a>
              .
            </p>
          </div>
          <div className="flex-1 min-w-[300px] max-w-[560px]">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/3v4yBHtCGGk"
                title="ClioX Overview"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="mt-4">
              <span className="inline-block bg-amber-50 text-amber-700 text-xs font-semibold uppercase px-3 py-1 rounded-xl">
                Featured
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div>
        <div className="w-full mb-10">
          <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center">
            <SearchIcon className="w-5 h-5 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search across all resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base text-gray-700 placeholder-gray-500 border-none outline-none bg-transparent"
            />
          </div>
          {searchResultsText && (
            <div className="mt-3 text-sm text-gray-600">
              {searchResultsText}
            </div>
          )}
        </div>

        {/* Tabs - hide when searching */}
        {searchQuery.trim() === '' && (
          <div className="flex flex-wrap justify-center gap-4 py-5 mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center px-4 py-2.5 cursor-pointer font-semibold text-base h-12 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-amber-700 border-amber-700'
                    : 'text-black border-transparent hover:text-amber-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 pb-16">
          {loading && searchQuery.trim() === '' ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">Loading resources...</p>
            </div>
          ) : (
            filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    e.currentTarget.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDMyMCAxNjAiIGZpbGw9Im5vbGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTYwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjE2MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD4KPC9zdmc+'
                  }}
                />
                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs font-semibold uppercase text-gray-600 mb-2">
                    {card.tag}
                  </div>
                  <h3 className="text-xl font-bold mb-2.5 text-black">
                    {card.title}
                  </h3>
                  <p className="text-base text-gray-600 flex-grow mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  <a
                    href={card.link}
                    className="text-amber-700 font-semibold text-sm hover:underline hover:text-amber-800 transition-colors duration-200"
                  >
                    Read more →
                  </a>
                </div>
              </div>
            ))
          )}
          {!loading &&
            filteredCards.length === 0 &&
            searchQuery.trim() === '' && (
              <div className="col-span-full text-center py-16">
                <p className="text-gray-500 text-lg">
                  No resources found in this category.
                </p>
              </div>
            )}
          {filteredCards.length === 0 && searchQuery.trim() !== '' && (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">
                No resources found matching your search.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try using different keywords or clear your search to browse all
                resources.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
