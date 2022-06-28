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

export declare type MenuItem = {
  name: string
  link: string
}

function MenuLink({ item }: { item: MenuItem }) {
  const location = useLocation()

  const classes =
    location?.pathname === item.link
      ? `${styles.link} ${styles.active}`
      : styles.link

  return (
    <Link key={item.name} to={item.link} className={classes}>
      {item.name}
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
            {menu.map((item: MenuItem) => (
              <li key={item.name}>
                <MenuLink item={item} />
              </li>
            ))}
            <li>
              <MenuDropdown
                label="Ecosystem"
                links={[
                  {
                    name: 'test1',
                    link: 'http://localhost:8000'
                  },
                  {
                    name: 'test2',
                    subLinks: [
                      { name: 'test5', link: 'http://localhost:8000' },
                      { name: 'test6', link: 'http://localhost:8000' }
                    ]
                  }
                ]}
              />
            </li>
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
