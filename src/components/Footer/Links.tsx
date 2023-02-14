import React, { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import Button from '@shared/atoms/Button'
import Link from 'next/link'
import styles from './Links.module.css'
import { useMarketMetadata } from '@context/MarketMetadata'

export default function Links(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const { setShowPPC, privacyPolicySlug } = useUserPreferences()
  const cookies = useGdprMetadata()

  const { content, privacyTitle } = siteContent.footer

  return (
    <div className={styles.container}>
      {content?.map((section, i) => (
        <div key={i} className={styles.section}>
          <p className={styles.title}>{section.title}</p>
          <div className={styles.links}>
            {section.links.map((e, i) =>
              e.link.startsWith('/') ? (
                <Link key={i} href={e.link}>
                  {e.name}
                </Link>
              ) : (
                <a
                  key={i}
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {e.name} &#8599;
                </a>
              )
            )}
          </div>
        </div>
      ))}
      <div className={styles.section}>
        <p className={styles.title}>{privacyTitle}</p>
        <div className={styles.links}>
          <Link href="/imprint">Imprint</Link>
          <Link href={privacyPolicySlug}>Privacy</Link>
          {appConfig.privacyPreferenceCenter === 'true' && (
            <Button
              style="text"
              size="small"
              onClick={() => {
                setShowPPC(true)
              }}
            >
              {cookies.optionalCookies ? 'Cookie Settings' : 'Cookies'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
