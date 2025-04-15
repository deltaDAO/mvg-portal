import { ReactElement } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import loadable from '@loadable/component'
import Logo from '@shared/atoms/Logo'
import Networks from './UserPreferences/Networks'
import styles from './Menu.module.css'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import classNames from 'classnames/bind'
import MenuDropdown from '@components/@shared/MenuDropdown'
import SearchButton from './SearchButton'
import Button from '@components/@shared/atoms/Button'
import UserPreferences from './UserPreferences'
import { SsiWallet } from '@components/Header/SsiWallet'
import Upload from '@images/publish.svg'
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
  const router = useRouter()
  const handlePublishClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push('/publish/1')
  }
  const handleCatalogClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    router.push('/search?sort=credentialSubject.nft.created&sortOrder=desc')
  }

  return (
    <nav className={styles.menu}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Logo />
        </Link>

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
          <SsiWallet />
          <div className={styles.ctaContent}>
            <button className={styles.ctaButton} onClick={handlePublishClick}>
              <div className={styles.buttonContent}>
                <Upload className={styles.uploadIcon} />
                <span className={styles.buttonText}>Publish</span>
              </div>
            </button>
            <button className={styles.ctaButton} onClick={handleCatalogClick}>
              <div className={styles.buttonContent}>
                <span className={styles.buttonText}>Catalogue</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
