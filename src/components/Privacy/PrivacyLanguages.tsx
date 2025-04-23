import { Fragment, ReactElement } from 'react'
import styles from './PrivacyLanguages.module.css'
import { usePrivacyMetadata } from '@hooks/usePrivacyMetadata'
import { useUserPreferences } from '@context/UserPreferences'
import Link from 'next/link'

export default function PrivacyLanguages({
  label,
  isCookie = false
}: {
  label?: string
  isCookie?: boolean
}): ReactElement {
  const { policies } = usePrivacyMetadata(isCookie)
  const { setPrivacyPolicySlug } = useUserPreferences()

  return (
    <div className={styles.langSelect}>
      <span className={styles.langLabel}>{label || 'Language'}</span>
      <div className={styles.langOptions}>
        {policies.map((policy, i) => {
          const slug = isCookie
            ? `/cookies/${policy.policy}`
            : `/privacy/${policy.policy}`
          return (
            <Fragment key={policy.policy}>
              {i > 0 && ' — '}
              <Link
                href={slug}
                onClick={() => {
                  setPrivacyPolicySlug(slug)
                }}
              >
                {policy.language}
              </Link>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
