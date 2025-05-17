import Container from '@components/@shared/atoms/Container'
import Link from 'next/link'
import Button from '../Home/common/Button'
import SearchBar from '../Header/SearchBar'
import styles from '../Header/SearchBar.module.css'
import { useEffect, useState } from 'react'
import { getLandingPageContent } from '@utils/landingPageContent'

const scrollToElement = (e: React.MouseEvent, selector: string): void => {
  e.preventDefault()
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth'
  })
}

export default function Hero() {
  const [headerHeight, setHeaderHeight] = useState(0)
  const content = getLandingPageContent()

  // Measure header height and update on window resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerElement = document.querySelector('header')
      if (headerElement) {
        setHeaderHeight(headerElement.offsetHeight)
      }
    }

    // Initial measurement
    updateHeaderHeight()

    // Update on window resize
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [])

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{
        padding: '48px',
        height: `calc(100vh - ${headerHeight}px)`,
        minHeight: '600px' // Set minimum height to ensure content is visible on smaller screens
      }}
    >
      {/* Hero background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/images/hero-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-1"></div>

      {/* Glass overlay */}
      <div className="glass-overlay absolute inset-0 z-1"></div>

      {/* Search Bar for home page - positioned at the top */}
      <div className="absolute top-0 left-0 right-0 z-20 py-5 flex justify-center">
        <div className="max-w-xl w-full px-4">
          <div className={styles.searchHome}>
            <SearchBar placeholder={content.hero.searchPlaceholder} />
          </div>
        </div>
      </div>

      <Container className="relative z-10 flex flex-col justify-center h-full">
        <div className="flex flex-col max-w-[800px]">
          <h1 className="font-sans text-4xl md:text-5xl leading-normal tracking-[-0.019em] font-bold mb-6 text-white">
            {content.hero.title.split('|').map((part, index) => (
              <span key={index}>
                {part}
                {index < content.hero.title.split('|').length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="font-serif text-lg md:text-xl leading-normal tracking-[-0.019em] font-normal text-left max-w-3xl mb-16 text-white">
            {content.hero.description}
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              href="#choose-role"
              onClick={(e) => scrollToElement(e, '#choose-role')}
            >
              <Button
                variant="primary"
                size="lg"
                className="text-white border-2 transform transition-all duration-200 ease-in-out min-w-[140px] px-7 py-3 font-semibold"
              >
                {content.hero.primaryCta}
              </Button>
            </Link>
            <Link
              href="#what-we-do"
              onClick={(e) => scrollToElement(e, '#what-we-do')}
            >
              <Button
                variant="secondary"
                size="lg"
                className="text-black border-2 transform transition-all duration-200 ease-in-out min-w-[140px] px-7 py-3 font-semibold"
              >
                {content.hero.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
