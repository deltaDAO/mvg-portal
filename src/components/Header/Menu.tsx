import { ReactElement } from 'react'
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
import Automation from './UserPreferences/Automation'
import NetworkMenu from './NetworkMenu'
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
  isLive?: boolean
}

export function MenuLink({ name, link, className, isLive }: MenuItem) {
  const router = useRouter()

  const basePath = router?.pathname.split(/[/?]/)[1]
  const baseLink = link.split(/[/?]/)[1]

  const classes = cx({
    link: true,
    active: link.startsWith('/') && basePath === baseLink,
    [className]: className
  })

  return isLive === false ? (
    <></>
  ) : (
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

  return (
    <nav className={styles.menu}>
      <Link href="/" className={styles.logo}>
        <Logo />
      </Link>

      <ul className={styles.navigation}>
        {siteContent?.menu.map((item: MenuItem) => (
          <li key={item.name}>
            {item?.subItems ? (
              <MenuDropdown label={item.name} items={item.subItems} />
            ) : (
              <MenuLink {...item} />
            )}
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <SearchButton />
        {appConfig.chainIdsSupported.length > 1 && <Networks />}
        <NetworkMenu />
        <Wallet />
        {appConfig.automationConfig.enableAutomation === 'true' && (
          <Automation />
        )}
        <UserPreferences />
      </div>
    </nav>
  )
}
