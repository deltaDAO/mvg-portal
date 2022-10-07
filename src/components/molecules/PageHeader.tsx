import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './PageHeader.module.css'
import Markdown from '../atoms/Markdown'
import Logo from '../atoms/Logo'
import Badge from '../atoms/Badge'
import SearchBar from './SearchBar'

const cx = classNames.bind(styles)

export default function PageHeader({
  title,
  isHome,
  showSearch,
  searchPlaceholder,
  description,
  center,
  powered,
  isEdgeProvider
}: {
  title: string
  isHome: boolean
  showSearch: boolean
  searchPlaceholder: string
  description?: string
  center?: boolean
  powered?: boolean
  isEdgeProvider?: boolean
}): ReactElement {
  const styleClasses = cx({
    header: true,
    center,
    isHome
  })

  return (
    <header className={styleClasses}>
      {isHome ? (
        <div className={styles.homeTitleContainer}>
          {title.split(' - ').map((text, i) => (
            <h1 key={i} className={styles.title}>
              {text}
            </h1>
          ))}
        </div>
      ) : (
        <h1 className={styles.title}>
          {title} {isEdgeProvider && <Badge label="EDGE" large />}
        </h1>
      )}
      {description && (
        <Markdown text={description} className={styles.description} />
      )}
      {showSearch && (
        <div className={styles.search}>
          <SearchBar
            visibleInput
            name="searchInput"
            placeholder={searchPlaceholder}
          />
        </div>
      )}
      {powered && (
        <div className={styles.poweredByContainer}>
          <p>powered by</p>
          <a
            href="https://oceanprotocol.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Logo />
          </a>
        </div>
      )}
    </header>
  )
}
