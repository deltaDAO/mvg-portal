import React, { ReactElement } from 'react'
import Image from 'next/image'
import { useMarketMetadata } from '@context/MarketMetadata'
import styles from './index.module.css'

import Features from './Features/Features'
import Upload from '@images/publish.svg'
import MercedesLogo from '@images/Mercedes-Logo.svg'
import DeltaDaoLogo from '@images/deltaDAO.svg'
import TvlLogo from '@images/Tvl.svg'
import EuproLogo from '@images/eupro.svg'
import OceanHeroLogo from '@images/ocean-hero.svg'
import SearchLogo from '@images/search.svg'
import Menu from './Menu/Menu'

function HeroSection(): ReactElement {
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
              <button className={styles.ctaButton}>
                <div className={styles.buttonContent}>
                  <Upload className={styles.uploadIcon} />
                  <span className={styles.buttonText}>Publish</span>
                </div>
              </button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.searchBlock}>
              <h3 className={styles.ctaTitle}>Search for data</h3>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search"
                  className={styles.searchInput}
                />
                <button className={styles.searchButton}>
                  <SearchLogo className={styles.searchIcon} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ecosystem}>
          {/* <div className={styles.ecosystemDivider}></div>
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
          </div> */}
        </div>
      </div>
    </section>
  )
}

export default function HomePage(): ReactElement {
  const { siteContent } = useMarketMetadata()

  return (
    <>
      <HeroSection />
      <Features />
    </>
  )
}
