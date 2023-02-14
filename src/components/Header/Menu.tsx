import React, { ReactElement } from 'react'
import Link from 'next/link'
import loadable from '@loadable/component'
import Logo from '@shared/atoms/Logo'
import Networks from './UserPreferences/Networks'
import SearchBar from './SearchBar'
import styles from './Menu.module.css'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import classNames from 'classnames/bind'
const Wallet = loadable(() => import('./Wallet'))

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link: string
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

  return link.startsWith('/') ? (
    <Link key={name} href={link} className={classes}>
      {name}
    </Link>
  ) : (
    <a
      href={link}
      className={classes}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name} &#8599;
    </a>
  )
}

export default function Menu(): ReactElement {
  const { appConfig } = useMarketMetadata()
  const { siteContent } = useMarketMetadata()

  return (
    <nav className={styles.menu}>
      <Link href="/" className={styles.logo}>
        <Logo branding />
      </Link>

      <ul className={styles.navigation}>
        {siteContent?.menu.map((item: MenuItem) => (
          <li key={item.name}>
            <MenuLink {...item} />
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <SearchBar />
        {appConfig.chainIdsSupported.length > 1 && <Networks />}
        <Wallet />
      </div>
    </nav>
  )
}
