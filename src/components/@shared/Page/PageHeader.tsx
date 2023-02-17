import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './PageHeader.module.css'
import Markdown from '@shared/Markdown'
import SearchBar from '@components/Header/SearchBar'

const cx = classNames.bind(styles)

export default function PageHeader({
  title,
  description,
  showSearch,
  center
}: {
  title: ReactElement
  description?: string
  showSearch: boolean
  center?: boolean
}): ReactElement {
  const styleClasses = cx({
    header: true,
    center
  })

  return (
    <header className={styleClasses}>
      <h1 className={styles.title}>{title}</h1>
      {description && (
        <Markdown text={description} className={styles.description} />
      )}
      {showSearch && (
        <div className={styles.search}>
          <SearchBar visibleInput placeholder="Search for service offerings" />
        </div>
      )}
    </header>
  )
}
