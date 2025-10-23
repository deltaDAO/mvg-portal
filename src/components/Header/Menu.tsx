import { ReactElement, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import loadable from '@loadable/component'
import Logo from '@shared/atoms/Logo'
import Networks from './UserPreferences/Networks'
import styles from './Menu.module.css'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import classNames from 'classnames/bind'
// import MenuDropdown from '@components/@shared/MenuDropdown'
// import SearchButton from './SearchButton'
import Button from '@components/@shared/atoms/Button'
import UserPreferences from './UserPreferences'
import { SsiWallet } from '@components/Header/SsiWallet'
import Upload from '@images/publish.svg'
import BurgerIcon from '@images/burgerIcon.svg' // You'll need to add a burger icon
import CloseIcon from '@images/closeIcon.svg' // You'll need to add a close icon

const Wallet = loadable(() => import('./Wallet'))

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
  subItems?: MenuItem[]
  description?: string
  image?: string
  category?: string
  className?: string
}

export function MenuLink({ name, link, className }: MenuItem) {
  const router = useRouter()

  const basePath = router?.pathname.split(/[/?]/)[1]
  const baseLink = link.split(/[/?]/)[1]

  const classes = cx({
    link: true,
    active: link.startsWith('/') && basePath === baseLink,
    [className]: className
  })

  return (
    <Button
      className={classes}
      {...(link.startsWith('/') ? { to: link } : { href: link })}
    >
      {name}
    </Button>
  )
}

export default function Menu(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const router = useRouter()

  const isPublishRoute = router.pathname.startsWith('/publish')
  const isCatalogRoute =
    router.pathname === '/search' &&
    router.query.sort === 'indexedMetadata.event.block' &&
    router.query.sortOrder === 'desc'

  const showPublishButton = !isPublishRoute
  const showCatalogButton = !isCatalogRoute

  const publishLink = '/publish/1'
  const catalogLink = '/search?sort=indexedMetadata.event.block&sortOrder=desc'

  const handlePublishClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push(publishLink)
    setIsMobileMenuOpen(false)
  }
  const handleCatalogClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push(catalogLink)
    setIsMobileMenuOpen(false)
  }
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }
  const handleWalletClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={styles.menu}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Logo />
        </Link>
        <div className={styles.demoText}>Demonstration MarketPlace</div>

        {/* <ul className={styles.navigation}>
        {siteContent?.menu.map((item: MenuItem) => (
          <li key={item.name}>
            {item?.subItems ? (
              <MenuDropdown label={item.name} items={item.subItems} />
            ) : (
              <MenuLink {...item} />
            )}
          </li>
        ))}
        </ul> */}

        <div className={styles.actions}>
          {/* <SearchButton /> */}
          {appConfig.chainIdsSupported.length > 1 && <Networks />}
          <UserPreferences />
          <Wallet />
          {/* Desktop view - show SSiWallet and buttons normally */}
          <div className={styles.desktopActions}>
            <SsiWallet />
            <div className={styles.ctaContent}>
              {showPublishButton && (
                <Link className={styles.ctaButton} href={publishLink}>
                  <div className={styles.buttonContent}>
                    <Upload className={styles.uploadIcon} />
                    <span className={styles.buttonText}>Publish</span>
                  </div>
                </Link>
              )}
              {showCatalogButton && (
                <Link className={styles.ctaButton} href={catalogLink}>
                  <div className={styles.buttonContent}>
                    <span className={styles.buttonText}>Catalogue</span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile burger menu button */}
          <button className={styles.burgerButton} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <CloseIcon className={styles.closeIcon} />
            ) : (
              <BurgerIcon className={styles.burgerIcon} />
            )}
          </button>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`${styles.mobileMenu} ${
            isMobileMenuOpen ? styles.mobileMenuOpen : ''
          }`}
        >
          <button
            className={styles.mobileCloseButton}
            onClick={toggleMobileMenu}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileWallet} onClick={handleWalletClick}>
              <SsiWallet />
            </div>
            {showPublishButton && (
              <button
                className={styles.mobileCtaButton}
                onClick={handlePublishClick}
              >
                <div className={styles.buttonContent}>
                  <Upload className={styles.uploadIcon} />
                  <span className={styles.buttonText}>Publish</span>
                </div>
              </button>
            )}
            {showCatalogButton && (
              <button
                className={styles.mobileCtaButton}
                onClick={handleCatalogClick}
              >
                <div className={styles.buttonContent}>
                  <span className={styles.buttonText}>Catalogue</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
