import { ReactElement } from 'react'
import ScrollProgressBar from './ScrollProgressBar'

interface ArticleProps {
  slug: string
}

export default function Article({ slug }: ArticleProps): ReactElement {
  // For now, we'll hardcode the article content. In the future, this could fetch from CMS
  const articleData = {
    title: 'Web1.0 to Web3.0: Evolutions of the Internet',
    author: 'Faith',
    date: 'June 5, 2025',
    heroImage: '/images/web1.0toweb3.0_banner.jpg',
    content: {
      sections: [
        {
          title: 'Web 1.0: The Digital Library Era',
          content: `In the early 1990s, the internet was a vast, untapped library of information. This era, often called Web 1.0 or the "Information Web," marked the beginning of the digital age. Websites were simple and static, resembling digital books filled with knowledge. The internet's foundation was laid with basic HTML pages and early search engines like Yahoo, paving the way for the digital revolution.`
        },
        {
          title: 'Web 2.0: The Social Revolution',
          content: `Fast forward to the early 2000s, and we enter the era of Web 2.0. The internet underwent a significant transformation, becoming a lively and interactive community. Social media platforms such as Facebook, Twitter, and YouTube emerged, connecting people from all over the globe. The internet shifted from being a platform for reading to one for sharing, collaborating, and connecting with others.`
        },
        {
          title: 'Web 3.0: The Age of Ownership and Trust',
          content: `Now, we stand on the cusp of Web 3.0, a revolutionary phase that promises to redefine the internet again. At its core, Web 3.0 is about decentralization, transparency, and trust. It leverages blockchain technology, a secure method for tracking information, to empower users with control over their data.`
        }
      ],
      quote: 'Web 3.0 invites everyone to shape their digital destiny.',
      finalParagraph: `This era opens up a new world of possibilities, including decentralized finance (DeFi), and digital art (NFTs), where users have the power to shape their digital destiny. It's as if the internet is coming of age, inviting everyone to join the celebration.`
    }
  }

  const furtherReading = [
    {
      source: 'Washington Post Live',
      title: 'Tim Berners-Lee - How He Came Up With the Internet',
      url: 'https://youtu.be/fbV82k-ExT0?si=-v4qN9y8ZubMUuS3'
    },
    {
      source: 'Ethereum.org',
      title: 'What is Web3 & Why is it Important?',
      url: 'https://ethereum.org/en/web3/'
    },
    {
      source: 'Science Direct',
      title: 'Blockchain Research & Applications',
      url: 'https://www.sciencedirect.com/journal/blockchain-research-and-applications'
    }
  ]

  const handleShare = (platform: string) => {
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

  return (
    <div className="-mb-16">
      <ScrollProgressBar />

      {/* Hero Image */}
      <img
        src={articleData.heroImage}
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
            By {articleData.author} • {articleData.date}
          </div>
        </header>

        {/* Blog Content */}
        <article className="prose prose-lg max-w-none">
          {articleData.content.sections.map((section, index) => (
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
          <blockquote className="text-xl md:text-2xl italic text-[var(--brand-clay)] border-l-4 border-[var(--brand-clay)] pl-5 my-10">
            &ldquo;{articleData.content.quote}&rdquo;
          </blockquote>

          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8 font-[var(--font-family-body)]">
            {articleData.content.finalParagraph}
          </p>

          {/* Share Icons */}
          <div className="text-center mt-10 mb-12">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Share on Twitter"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.58 8.58 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99-3.56-.18-6.72-1.88-8.83-4.46a4.29 4.29 0 0 0 1.33 5.72c-.7-.02-1.37-.22-1.95-.53v.05c0 2.1 1.5 3.86 3.49 4.26-.36.1-.75.15-1.14.15-.28 0-.55-.03-.82-.08.55 1.71 2.15 2.95 4.05 2.99A8.6 8.6 0 0 1 2 19.54 12.13 12.13 0 0 0 8.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.54A8.37 8.37 0 0 0 22.46 6z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Share on Facebook"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.2 1.8.2v2h-1c-1 0-1.3.6-1.3 1.3v1.8h2.2l-.4 2.9h-1.8v7A10 10 0 0 0 22 12z" />
                </svg>
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Share on LinkedIn"
              >
                <svg
                  className="w-6 h-6 fill-[var(--brand-clay)] hover:scale-110 transition-transform duration-200"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM7.1 19.2H4.5v-9h2.6v9zm-1.3-10.3a1.5 1.5 0 1 1 .1-3 1.5 1.5 0 0 1-.1 3zm13.5 10.3h-2.6v-4.4c0-1.1-.4-1.8-1.4-1.8-.8 0-1.3.5-1.5 1-.1.2-.1.5-.1.8v4.4h-2.6s.1-7.2 0-7.9h2.6v1.1c.3-.5 1-1.3 2.4-1.3 1.7 0 2.9 1.1 2.9 3.5v4.6z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Further Reading */}
          <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--font-color-heading)]">
            You Might Also Like
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {furtherReading.map((item, index) => (
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
        </article>
      </div>
    </div>
  )
}
