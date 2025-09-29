import { ReactElement } from 'react'
import Link from 'next/link'
import loadable from '@loadable/component'
import Logo from '@shared/atoms/Logo'
import Networks from '../../Header/UserPreferences/Networks'
import styles from './index.module.css'
import { useRouter } from 'next/router'
import { useMarketMetadata } from '@context/MarketMetadata'
import classNames from 'classnames/bind'
import Button from '@components/@shared/atoms/Button'
import UserPreferences from '../../Header/UserPreferences'
import { SsiWallet } from './SsiWallet'
const Wallet = loadable(() => import('../../Header/Wallet'))

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

  return (
    <nav className={styles.menu}>
      <Link href="/" className={styles.logo}>
        <Logo />
      </Link>
      <div className={styles.demoText}>Demonstration MarketPlace</div>
      <div className={styles.actions}>
        {appConfig.chainIdsSupported.length > 1 && <Networks />}
        <UserPreferences />
        <Wallet />
        <SsiWallet />
      </div>
    </nav>
  )
}
