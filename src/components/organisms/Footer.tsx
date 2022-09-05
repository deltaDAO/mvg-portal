import React, { ReactElement } from 'react'
import styles from './Footer.module.css'
import Markdown from '../atoms/Markdown'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import { Link } from 'gatsby'
import { useUserPreferences } from '../../providers/UserPreferences'
import Button from '../atoms/Button'
import { useGdprMetadata } from '../../hooks/useGdprMetadata'

export default function Footer(): ReactElement {
  const { copyright, appConfig } = useSiteMetadata()
  const { setShowPPC } = useUserPreferences()
  const { privacyPolicySlug } = useUserPreferences()

  const cookies = useGdprMetadata()

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.copyright}>
          © {year} <Markdown text={copyright} />
          <br />
          <Link to="/imprint">Imprint</Link>
          {' — '}
          <Link to={privacyPolicySlug}>Privacy</Link>
          {appConfig.privacyPreferenceCenter === 'true' && (
            <>
              {' — '}
              <Button
                style="text"
                size="small"
                className="link"
                onClick={() => {
                  setShowPPC(true)
                }}
              >
                {cookies.optionalCookies ? 'Cookie Settings' : 'Cookies'}
              </Button>
            </>
          )}
          {' — '}
          <Button
            className={styles.linkButton}
            style="text"
            href="https://stats.minimal-gaia-x.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            Statistics &#8599;
          </Button>
        </div>
      </div>
    </footer>
  )
}
