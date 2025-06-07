import { ReactElement } from 'react'
import ScrollProgressBar from './ScrollProgressBar'
import { ArticleMetadata } from '../../utils/loadResourcesServer'

interface DynamicArticleProps {
  article: ArticleMetadata
}

export default function DynamicArticle({
  article
}: DynamicArticleProps): ReactElement {
  const articleData = article

  const handleShare = (platform: string) => {
    if (!articleData) return

    const url = window.location.href
    const { title } = articleData

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        title
      )}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(title)}`
    }

    window.open(
      shareUrls[platform as keyof typeof shareUrls],
      '_blank',
      'noopener,noreferrer'
    )
  }

  const heroImageUrl = `/content/resources/articles/${articleData.slug}/${articleData.heroImage}`

  return (
    <div className="-mb-16">
      <ScrollProgressBar />

      {/* Hero Image */}
      <img
        src={heroImageUrl}
        alt="Article Hero Image"
        className="w-full max-h-96 object-cover block mb-5"
        onError={(e) => {
          e.currentTarget.src =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMTAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjExMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjU1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+QXJ0aWNsZSBJbWFnZTwvdGV4dD4KPC9zdmc+'
        }}
      />

      {/* Article Content - This will be wrapped by Container from Page component */}
      <div className="py-10">
        {/* Blog Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--font-color-heading)]">
            {articleData.title}
          </h1>
          <div className="text-sm text-gray-600">
            By {articleData.author} •{' '}
            {new Date(articleData.publishDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}{' '}
            • {articleData.readTime}
          </div>
        </header>

        {/* Blog Content */}
        <article className="prose prose-lg max-w-none">
          {articleData.sections.map((section, index) => (
            <div key={index} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-10 first:mt-0 text-[var(--font-color-heading)]">
                {section.title}
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4 font-[var(--font-family-body)]">
                {section.content}
              </p>
            </div>
          ))}

          {/* Pull Quote */}
          {articleData.quote && (
            <blockquote className="text-xl md:text-2xl italic text-[var(--brand-clay)] border-l-4 border-[var(--brand-clay)] pl-5 my-10">
              &ldquo;{articleData.quote}&rdquo;
            </blockquote>
          )}

          {articleData.finalParagraph && (
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8 font-[var(--font-family-body)]">
              {articleData.finalParagraph}
            </p>
          )}

          {/* Share Icons */}
          <div className="text-center mt-10 mb-12">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                aria-label="Share on LinkedIn"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Further Reading */}
          {articleData.furtherReading &&
            articleData.furtherReading.length > 0 && (
              <>
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--font-color-heading)]">
                  You Might Also Like
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
                  {articleData.furtherReading.map((item, index) => (
                    <a
                      key={index}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-5 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 text-gray-700 no-underline"
                    >
                      <strong className="block text-sm text-[var(--brand-clay)] mb-2">
                        {item.source}
                      </strong>
                      <span className="text-base">{item.title}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
        </article>
      </div>
    </div>
  )
}
