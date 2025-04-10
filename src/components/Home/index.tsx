import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  useRef
} from 'react'
import type { MouseEvent } from 'react'
import Image from 'next/image'
import { useMarketMetadata } from '@context/MarketMetadata'
import styles from './index.module.css'
import InputElement from '@shared/FormInput/InputElement'

import Features from './Features/Features'
import Upload from '@images/publish.svg'
import MercedesLogo from '@images/Mercedes-Logo.svg'
import DeltaDaoLogo from '@images/deltaDAO.svg'
import TvlLogo from '@images/Tvl.svg'
import EuproLogo from '@images/eupro.svg'
import OceanHeroLogo from '@images/ocean-hero.svg'
import SearchLogo from '@images/search.svg'
import Menu from './Menu/Menu'
import { addExistingParamsToUrl } from '../Search/utils'
import { useRouter } from 'next/router'
import { useSearchBarStatus } from '@context/SearchBarStatus'

async function emptySearch() {
  const searchParams = new URLSearchParams(window?.location.href)
  const text = searchParams.get('text')

  if (text !== '' && text !== undefined && text !== null) {
    await addExistingParamsToUrl(location, ['text', 'owner', 'tags'])
  }
}

function HeroSection({
  placeholder,
  initialValue,
  isSearchPage
}: {
  placeholder?: string
  initialValue?: string
  isSearchPage?: boolean
}): ReactElement {
  const router = useRouter()
  const [value, setValue] = useState(initialValue || '')
  const parsed = router.query
  const searchBarRef = useRef<HTMLInputElement>(null)
  const {
    isSearchBarVisible,
    setSearchBarVisible,
    homeSearchBarFocus,
    setHomeSearchBarFocus
  } = useSearchBarStatus()

  useEffect(() => {
    if (parsed?.text || parsed?.owner)
      setValue((parsed?.text || parsed?.owner) as string)
  }, [parsed?.text, parsed?.owner])

  useEffect(() => {
    setSearchBarVisible(false)
    setHomeSearchBarFocus(false)
  }, [setSearchBarVisible, setHomeSearchBarFocus])

  useEffect(() => {
    if (!isSearchBarVisible && !homeSearchBarFocus) return
    if (searchBarRef?.current) {
      searchBarRef.current.focus()
    }
  }, [isSearchBarVisible, homeSearchBarFocus])

  async function startSearch() {
    if (value === '') setValue(' ')

    const urlEncodedValue = encodeURIComponent(value)
    const url = await addExistingParamsToUrl(location, [
      'text',
      'owner',
      'tags'
    ])
    router.push(`${url}&text=${urlEncodedValue}`)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value)
    e.target.value === '' && emptySearch()
  }

  async function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      await startSearch()
    }
  }

  async function handleButtonClick(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault()
    await startSearch()
  }
  const handlePublishClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push('/publish/1')
  }
  const handleCatalogClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push('/search?sort=credentialSubject.nft.created&sortOrder=desc')
  }

  return (
    <section className={styles.hero}>
      <div className={styles.contentContainer}>
        <header>
          <Menu />
        </header>
        <div className={styles.textContent}>
          <h1 className={styles.title}>
            Ocean Enterprise Demonstration Marketplace
          </h1>
          <div className={styles.subtitle}>
            <p>
              Publish, find, compare, manage and monetize proprietary data & AI
              products in a secure, trusted and compliant environment
            </p>
          </div>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaBlock}>
              <h3 className={styles.ctaTitle}>Publish an asset</h3>
              <button className={styles.ctaButton} onClick={handlePublishClick}>
                <div className={styles.buttonContent}>
                  <Upload className={styles.uploadIcon} />
                  <span className={styles.buttonText}>Publish</span>
                </div>
              </button>
            </div>

            <div className={styles.divider}></div>

            <form
              className={styles.searchBlock}
              autoComplete={!value ? 'off' : 'on'}
            >
              <h3 className={styles.ctaTitle}>Search for data</h3>
              <div className={styles.searchContainer}>
                <InputElement
                  ref={searchBarRef}
                  type="search"
                  name="search"
                  placeholder={placeholder || 'Search'}
                  value={value}
                  onChange={handleChange}
                  required
                  size="large"
                  className={styles.searchInput}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleButtonClick}
                  className={styles.searchButton}
                >
                  <SearchLogo className={styles.searchIcon} />
                </button>
              </div>
            </form>
            <div className={styles.divider}></div>

            <div className={styles.ctaBlock}>
              <h3 className={styles.ctaTitle}>Go to Catalog</h3>
              <button className={styles.ctaButton} onClick={handleCatalogClick}>
                <div className={styles.buttonContent}>
                  <span className={styles.buttonText}>Catalog</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* <div className={styles.ecosystem}>
          <div className={styles.ecosystemDivider}></div>
          <p className={styles.ecosystemTitle}>
            DECENTRALIZED ECOSYSTEM POWERED BY
          </p>
          <div className={styles.logos}>
            <div className={styles.logoItem}>
              <TvlLogo className={styles.logoImage} />
            </div>
            <div className={styles.logoItem}>
              <MercedesLogo className={styles.logoImage} />
            </div>
            <div className={styles.logoItem}>
              <DeltaDaoLogo className={styles.logoImage} />
            </div>
            <div className={styles.logoItem}>
              <OceanHeroLogo className={styles.logoImage} />
            </div>
            <div className={styles.logoItem}>
              <EuproLogo className={styles.logoImage} />
            </div>
          </div>
        </div> */}
      </div>
    </section>
  )
}

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <Features />
    </>
  )
}
