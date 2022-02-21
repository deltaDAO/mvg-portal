import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Markdown from '../../atoms/Markdown'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import { ReactComponent as Hashtag } from '../../../images/Hashtag.svg'
import Links from './Links'

export default function Footer(): ReactElement {
  // TODO: replace placeholder footer content
  const { footer } = useSiteMetadata()
  const { title, subtitle, copyright } = footer

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.main}>
          <Hashtag />
          <p>{title}</p>
          <p>{subtitle}</p>
        </div>
        <Links />
      </div>
      <div className={styles.copyright}>
        <Markdown text={copyright} />
      </div>
    </footer>
  )
}
