import { ReactElement } from 'react'
import styles from './Footer.module.css'
import Links from './Links'
import { useMarketMetadata } from '@context/MarketMetadata'
// import Container from '@components/@shared/atoms/Container'
// import Image from 'next/image'
// import logo from '../../../public/images/ecosystem/ocean_enterprise_logo.png'
import Logo from '@images/logo.svg'
import XIcon from '@images/xIcon.svg'
import LinkedInIcon from '@images/linkedInIcon.svg'
import MediumIcon from '@images/mediumIcon.svg'

export default function Footer(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const { footer } = siteContent
  const { copyright } = footer

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Logo className={styles.logo} />
          <div className={styles.socialLinks}>
            <a
              href="https://x.com/ocnenterprise"
              target="_blank"
              rel="noopener noreferrer"
            >
              <XIcon className={styles.socialIcon} />
            </a>
            <a
              href="https://www.linkedin.com/company/ocean-enterprise-collective"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkedInIcon className={styles.socialIcon} />
            </a>
            <a
              href="https://medium.com/ocean-enterprise-collective"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MediumIcon className={styles.socialIcon} />
            </a>
          </div>
        </div>
        <Links />
      </div>
      <p className={styles.copyright}>{copyright}</p>
    </footer>
  )
}
