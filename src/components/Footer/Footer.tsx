import { ReactElement } from 'react'
import styles from './Footer.module.css'
import Links from './Links'
import { useMarketMetadata } from '@context/MarketMetadata'
import Container from '@components/@shared/atoms/Container'
import Image from 'next/image'
import logo from '../../../public/images/ecosystem/ocean_enterprise_logo.png'

export default function Footer(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const { footer } = siteContent
  const { copyright } = footer

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div className={styles.logoSection}>
          <Image
            src={logo}
            alt="Ocean Enterprise Logo"
            width={120}
            height={40}
          />
          <p className={styles.copyright}>{copyright}</p>
        </div>
        <Links />
      </Container>
    </footer>
  )
}
