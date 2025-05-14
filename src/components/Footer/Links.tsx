import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import Button from '@shared/atoms/Button'
import Logo from '@shared/atoms/Logo'
import { useMarketMetadata } from '@context/MarketMetadata'
import styles from './Links.module.css'

export default function Links(): ReactElement {
  const { appConfig } = useMarketMetadata()
  const { setShowPPC, privacyPolicySlug } = useUserPreferences()
  const cookies = useGdprMetadata()

  return (
    <div>
      {/* ClioX Logo with BETA - Mobile Only */}
      <div className="mb-10 md:hidden flex items-center gap-2">
        <div className={styles.footerLogo}>
          <Logo variant="horizontal" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 w-full">
        {/* Column 1: Clio-X */}
        <div>
          {/* Logo as title */}
          <div className={styles.titleContainer}>
            <div className="hidden md:flex items-center">
              <div className={styles.footerLogo}>
                <Logo variant="horizontal" />
              </div>
            </div>
          </div>

          <ul className="space-y-4 mt-0">
            <li>
              <Button
                to="/docs"
                className={`${styles.link} ${styles.footerLink}`}
                style="text"
              >
                Documentation
              </Button>
            </li>
            <li>
              <Button
                to="/newsletter"
                className={`${styles.link} ${styles.footerLink}`}
                style="text"
              >
                Newsletter
              </Button>
            </li>
            <li>
              <Button
                to="/bookmarks"
                className={`${styles.link} ${styles.footerLink}`}
                style="text"
              >
                Bookmarks
              </Button>
            </li>
          </ul>
        </div>

        {/* Column 2: Legal */}
        <div>
          <div className={styles.titleContainer}>
            <h3 className={styles.sectionTitle}>Legal</h3>
          </div>

          <ul className="space-y-4 mt-0">
            <li>
              <Button
                to={privacyPolicySlug || '/privacy'}
                className={`${styles.link} ${styles.footerLink}`}
                style="text"
              >
                Privacy Policy
              </Button>
            </li>
            <li>
              <Button
                to="/imprint"
                className={`${styles.link} ${styles.footerLink}`}
                style="text"
              >
                Imprint
              </Button>
            </li>
            {appConfig?.privacyPreferenceCenter === 'true' && (
              <li>
                <Button
                  style="text"
                  onClick={() => setShowPPC(true)}
                  className={`${styles.link} ${styles.footerLink}`}
                >
                  Cookie Settings
                </Button>
              </li>
            )}
          </ul>
        </div>

        {/* Column 3: Join the community */}
        <div>
          <div className={styles.titleContainer}>
            <h3 className={styles.sectionTitle}>Join the community</h3>
          </div>

          <p className={`${styles.subtitle} text-sm max-w-xs mb-6`}>
            Our newsletter provides you with latest data economy happenings on a
            monthly basis.
          </p>
          <button className="bg-[var(--color-primary)] hover:bg-[var(--color-highlight)] text-white font-bold py-2 px-6 rounded transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
