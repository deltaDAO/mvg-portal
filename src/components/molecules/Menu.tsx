import React, { ReactElement } from 'react'
import { Link } from 'gatsby'
import { useLocation } from '@reach/router'
import loadable from '@loadable/component'
import styles from './Menu.module.css'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import UserPreferences from './UserPreferences'
import Logo from '../atoms/Logo'
import Networks from './UserPreferences/Networks'
import SearchBar from './SearchBar'
import Container from '../atoms/Container'
import MenuDropdown from '../atoms/MenuDropdown'

const Wallet = loadable(() => import('./Wallet'))

function MenuLink({ name, link }: { name: string; link: string }) {
  const location = useLocation()

  const classes =
    location?.pathname === link
      ? `${styles.link} ${styles.active}`
      : styles.link

  return (
    <Link key={name} to={link} className={classes}>
      {name}
    </Link>
  )
}

export default function Menu(): ReactElement {
  const { menu, badge } = useSiteMetadata()

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
            <SearchBar />
            <Networks />
            <Wallet />
            <UserPreferences />
          </div>
        </nav>
      </Container>
    </div>
  )
}
