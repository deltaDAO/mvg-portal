import React, { ReactElement } from 'react'
import { Link } from 'gatsby'
import { useLocation } from '@reach/router'
import loadable from '@loadable/component'
import styles from './Menu.module.css'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import Logo from '../atoms/Logo'
import Networks from './UserPreferences/Networks'
import Container from '../atoms/Container'
import MenuDropdown from '../atoms/MenuDropdown'
import SearchButton from './SearchButton'

const Wallet = loadable(() => import('./Wallet'))

export function MenuLink({
  name,
  link
}: {
  name: string
  link: string
}): ReactElement {
  const location = useLocation()

  const classes =
    location?.pathname === link
      ? `${styles.link} ${styles.active}`
      : styles.link

  return link.startsWith('/') ? (
    <Link key={name} to={link} className={classes}>
      {name}
    </Link>
  ) : (
    <a
      href={link}
      className={classes}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  )
}

export default function Menu(): ReactElement {
  const { menu } = useSiteMetadata()

  return (
    <div className={styles.wrapper}>
      <Container>
        <nav className={styles.menu}>
          <Link to="/" className={styles.logo}>
            <Logo branding />
          </Link>

          <ul className={styles.navigation}>
            {menu.map((item) => (
              <li key={item.name}>
                {item?.subItems ? (
                  <MenuDropdown label={item.name} items={item.subItems} />
                ) : (
                  <MenuLink name={item.name} link={item.link} />
                )}
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <SearchButton />
            <Networks />
            <Wallet />
          </div>
        </nav>
      </Container>
    </div>
  )
}
