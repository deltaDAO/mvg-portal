import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import { useGdprMetadata } from '@hooks/useGdprMetadata'
import styles from './Links.module.css'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useRouter } from 'next/router'

export default function Links(): ReactElement {
  const { appConfig, siteContent } = useMarketMetadata()
  const { setShowPPC, privacyPolicySlug } = useUserPreferences()
  const cookies = useGdprMetadata()
  const router = useRouter()

  const { content, privacyTitle } = siteContent.footer

  return (
    <div className={styles.container}>
      {content?.map(
        (section, i) =>
          section.title !== 'Privacy' && (
            <div key={i} className={styles.section}>
              <p className={styles.title}>{section.title}</p>
              <div className={styles.links}>
                {section.links.map((e, i) => {
                  if (e.name === 'Cookie Settings') {
                    return (
                      <a
                        key={i}
                        className={styles.link}
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          setShowPPC(true)
                          router.push('/cookie-settings')
                        }}
                      >
                        {cookies.optionalCookies
                          ? 'Cookie Settings'
                          : 'Cookies'}
                      </a>
                    )
                  }
                  if (e.name === 'Imprint' || e.name === 'Privacy') {
                    return (
                      <a
                        key={i}
                        className={styles.link}
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          router.push(e.link)
                        }}
                      >
                        {e.name}
                      </a>
                    )
                  }
                  return (
                    <a
                      key={i}
                      className={styles.link}
                      href={e.link.startsWith('/') ? e.link : e.link}
                      target={e.link.startsWith('/') ? undefined : '_blank'}
                      rel={
                        e.link.startsWith('/')
                          ? undefined
                          : 'noopener noreferrer'
                      }
                    >
                      {e.name === 'Log' ? (
                        <>
                          <span>Log</span>
                          <span className={styles.logIcon}>&nbsp;↗</span>{' '}
                        </>
                      ) : (
                        e.name
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          )
      )}
      <div className={styles.section}>
        <p className={styles.title}>{privacyTitle}</p>
        <div className={styles.links}>
          <a
            className={styles.link}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              router.push('/imprint')
            }}
          >
            Imprint
          </a>
          <a
            className={styles.link}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              router.push(`${privacyPolicySlug}#terms-and-conditions`)
            }}
          >
            Terms & Conditions
          </a>
          <a
            className={styles.link}
            href="#"
            onClick={(event) => {
              event.preventDefault()
              router.push(`${privacyPolicySlug}#privacy-policy`)
            }}
          >
            Privacy Policy
          </a>
          {appConfig.privacyPreferenceCenter === 'true' && (
            <a
              className={styles.link}
              href="#"
              onClick={(event) => {
                event.preventDefault()
                setShowPPC(true)
                router.push('/cookie-settings')
              }}
            >
              {cookies.optionalCookies ? 'Cookie Settings' : 'Cookies'}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
