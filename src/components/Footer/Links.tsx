import React, { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import Button from '@shared/atoms/Button'
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
            {section.links.map((e, i) => (
              <Button
                key={i}
                className={styles.link}
                {...(e.link.startsWith('/')
                  ? { to: e.link }
                  : { href: e.link })}
              >
                {e.name}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.section}>
        <p className={styles.title}>{privacyTitle}</p>
        <div className={styles.links}>
          <Button to="/imprint" className={styles.link}>
            Imprint
          </Button>
          <Button to={privacyPolicySlug} className={styles.link}>
            Privacy
          </Button>
          {appConfig.privacyPreferenceCenter === 'true' && (
            <Button
              className={styles.link}
              style="text"
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
