import { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './PageHeader.module.css'
import Markdown from '@shared/Markdown'
import SearchBar from '@components/Header/SearchBar'
import GaiaXLogo from '@images/gaia-x-logo.svg'

const cx = classNames.bind(styles)

export default function PageHeader({
  title,
  center,
  description,
  isHome,
  showSearch
}: {
  title: string | ReactElement
  center?: boolean
  description?: string
  isHome?: boolean
  showSearch?: boolean
}): ReactElement {
  const styleClasses = cx({
    header: true,
    center
  })

  return (
    <header className={styleClasses}>
      {isHome ? (
        <div className={styles.homeTitleContainer}>
          <h1>{(title as string).split(' - ')[0]}</h1>
          {description && (
            <Markdown text={description} className={styles.description} />
          )}
          <div className={styles.logoContainer}>
            <h4 className={styles.logoContainerTitle}>powered by</h4>
            <a
              href="https://gaia-x.eu/"
              target="_blank"
              rel="noreferrer noopener"
            >
              <GaiaXLogo />
            </a>
          </div>
        </div>
      ) : (
        <h1 className={styles.title}>{title}</h1>
      )}
      {description && !isHome && (
        <Markdown text={description} className={styles.description} />
      )}
      {showSearch && (
        <div className={styles.search}>
          <SearchBar placeholder="Search for service offerings" />
        </div>
      )}
    </header>
  )
}
