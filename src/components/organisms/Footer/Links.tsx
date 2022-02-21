import { Link } from 'gatsby'
import React, { ReactElement } from 'react'
import { useGdprMetadata } from '../../../hooks/useGdprMetadata'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import { useUserPreferences } from '../../../providers/UserPreferences'
import Button from '../../atoms/Button'
import styles from './Links.module.css'

export default function Links(): ReactElement {
  const { appConfig, footer } = useSiteMetadata()
  const { setShowPPC, privacyPolicySlug } = useUserPreferences()
  const { content, privacyTitle } = footer

  const cookies = useGdprMetadata()

  return (
    <div className={styles.container}>
      {content?.map((section, i) => (
        <div key={i} className={styles.section}>
          <p className={styles.title}>{section.title}</p>
          <div className={styles.links}>
            {section.links.map((e, i) => (
              <Link key={`${e.name}-${i}`} to={e.link}>
                {e.name}
              </Link>
            ))}
          </div>
        </div>
      ))}
      <div className={styles.section}>
        <p className={styles.title}>PRIVACY</p>
        <div className={styles.links}>
          <Link to="/imprint">Imprint</Link>
          <Link to="/terms">Terms</Link>
          <Link to={privacyPolicySlug}>{privacyTitle}</Link>
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
