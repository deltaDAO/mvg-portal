import { ReactElement, useState, useMemo, useEffect } from 'react'
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
  const [loading, setLoading] = useState(false)

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
    return resourceCards.filter((card) => {
      const matchesCategory = card.category === activeTab
      const matchesSearch =
        searchQuery === '' ||
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [resourceCards, activeTab, searchQuery])

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
                href="#contact"
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
              placeholder="Search for articles, videos, events"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base text-gray-700 placeholder-gray-500 border-none outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Tabs */}
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

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5 pb-16">
          {loading ? (
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
          {!loading && filteredCards.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">
                No resources found in this category
                {searchQuery && ' matching your search'}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
