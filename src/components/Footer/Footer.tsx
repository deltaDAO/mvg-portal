import { ReactElement } from 'react'
import styles from './Footer.module.css'
import Links from './Links'
import { useMarketMetadata } from '@context/MarketMetadata'
import BrandLogo from '@images/brand-logo-white.svg'
import Container from '@components/@shared/atoms/Container'

export default function Footer(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const { footer } = siteContent
  const { subtitle } = footer

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div>
          <a
            href="https://fiware-marketplace-a4eqd.ondigitalocean.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.main}>
              <BrandLogo />
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </a>
        </div>
        <Links />
      </Container>
    </footer>
  )
}
