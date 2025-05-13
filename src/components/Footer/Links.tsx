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
      {/* ClioX Logo with BETA */}
      <div className="mb-10 md:hidden flex items-center gap-2">
        <Logo />
        <span className={styles.betaBadge}>BETA</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 gap-x-12 w-full">
        {/* Column 1: Clio-X */}
        <div>
          {/* ClioX Logo with BETA for desktop */}
          <div className="hidden md:flex items-center gap-2 mb-6">
            <Logo />
            <span className={styles.betaBadge}>BETA</span>
          </div>

          {/* <h3 className={styles.sectionTitle}>Resources</h3> */}
          <ul className="space-y-3">
            <li>
              <Button to="/docs" className={styles.link} style="text">
                DOCUMENTATION
              </Button>
            </li>
            <li>
              <Button to="/newsletter" className={styles.link} style="text">
                NEWSLETTER
              </Button>
            </li>
          </ul>
        </div>

        {/* Column 2: Legal */}
        <div>
          <h3 className={styles.sectionTitle}>Legal</h3>
          <ul className="space-y-3">
            <li>
              <Button
                to={privacyPolicySlug || '/privacy'}
                className={styles.link}
                style="text"
              >
                PRIVACY POLICY
              </Button>
            </li>
            <li>
              <Button to="/imprint" className={styles.link} style="text">
                IMPRINT
              </Button>
            </li>
            {appConfig?.privacyPreferenceCenter === 'true' && (
              <li>
                <Button
                  style="text"
                  onClick={() => setShowPPC(true)}
                  className={styles.link}
                >
                  COOKIE SETTINGS
                </Button>
              </li>
            )}
          </ul>
        </div>

        {/* Column 3: Join the community */}
        <div>
          <h3 className={styles.sectionTitle}>Join the community</h3>
          <p className={`${styles.subtitle} text-sm max-w-xs mb-6`}>
            Our newsletter provides you with latest data economy happenings on a
            monthly basis.
          </p>
          <button className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-6 rounded transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}
