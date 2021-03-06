import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './PageHeader.module.css'
import Markdown from '../atoms/Markdown'
import Logo from '../atoms/Logo'

const cx = classNames.bind(styles)

export default function PageHeader({
  title,
  description,
  center,
  powered
}: {
  title: string
  description?: string
  center?: boolean
  powered?: boolean
}): ReactElement {
  const styleClasses = cx({
    header: true,
    center: center
  })

  return (
    <header className={styleClasses}>
      <h1 className={styles.title}>{title}</h1>
      {description && (
        <Markdown text={description} className={styles.description} />
      )}
      {powered && (
        <>
          <p className={styles.powered}>powered by</p>
          <a
            href="https://oceanprotocol.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Logo />
          </a>
        </>
      )}
    </header>
  )
}
