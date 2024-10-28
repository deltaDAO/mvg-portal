import { ReactElement } from 'react'
import styles from './Footer.module.css'
import Markdown from '@shared/Markdown'
import Links from './Links'
import { useMarketMetadata } from '@context/MarketMetadata'
import FundingLogo from '@images/funding.svg'
import FundingLogoAngliru from '@images/funding-angliru.svg'
import Container from '@components/@shared/atoms/Container'

export default function Footer(): ReactElement {
  const { siteContent } = useMarketMetadata()
  const { siteTitle, footer } = siteContent
  const { copyright, subtitle } = footer

  return (
    <footer className={styles.footer}>
      <Container className={styles.container}>
        <div>
          <div className={styles.main}>
            <FundingLogo /> <FundingLogoAngliru />
          </div>
          <p className={styles.siteTitle}>
            Supported by projects{' '}
            <a
              style={{ fontWeight: 'bold' }}
              target={'_blank'}
              href="https://sede.mineco.gob.es/es/SedePublications/report_PRP_global.pdf"
              rel="noreferrer"
            >
              TSI-100120-2024-28
            </a>{' '}
            and{' '}
            <a
              style={{ fontWeight: 'bold' }}
              target={'_blank'}
              href="https://angliru.udl.cat"
              rel="noreferrer"
            >
              PID2020-117912RB-C22
            </a>
          </p>
        </div>
        <Links />
      </Container>
      <div className={styles.copyright}>
        <Markdown text={copyright} />
      </div>
    </footer>
  )
}
