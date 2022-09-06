import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Markdown from '../../atoms/Markdown'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import { ReactComponent as DeltaDaoLogo } from '../../../images/deltaDAO_Logo_small_RGB_white.svg'
import Links from './Links'
import Container from '../../atoms/Container'

export default function Footer(): ReactElement {
  const { siteTitle, footer } = useSiteMetadata()
  const { copyright, subtitle } = footer

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div>
          <p className={styles.siteTitle}>{siteTitle}</p>
          <a
            href="https://delta-dao.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.main}>
              <DeltaDaoLogo />
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </a>
        </div>
        <Links />
      </Container>
      <div className={styles.copyright}>
        <Markdown text={copyright} />
      </div>
    </footer>
  )
}
