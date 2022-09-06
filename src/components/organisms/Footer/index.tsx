import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Markdown from '../../atoms/Markdown'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import { ReactComponent as DeltaDaoLogo } from '../../../images/deltaDAO_Logo_small_RGB_white.svg'
import Links from './Links'
import Container from '../../atoms/Container'

export default function Footer(): ReactElement {
  const { footer } = useSiteMetadata()
  const { copyright } = footer

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.main}>
          <DeltaDaoLogo />
        </div>
        <Links />
      </Container>
      <div className={styles.copyright}>
        <Markdown text={copyright} />
      </div>
    </footer>
  )
}
