import { Fragment, ReactElement } from 'react'
import styles from './PolicyLanguages.module.css'
import {
  useCookieMetadata,
  UsePolicyMetadata,
  usePrivacyMetadata
} from '@hooks/usePolicyMetadata'
import Link from 'next/link'

export default function PolicyLanguages({
  label,
  policies
}: {
  label?: string
  policies?: UsePolicyMetadata['policies']
}): ReactElement {
  /* const privacyMeta = usePrivacyMetadata()
  const cookieMeta = useCookieMetadata()
  const { policies } = isCookiePolicy ? cookieMeta : privacyMeta */
  console.log('policies', policies)
  const slug = policies?.[0].slug

  return (
    <div className={styles.langSelect}>
      <span className={styles.langLabel}>{label || 'Language'}</span>
      <div className={styles.langOptions}>
        {policies.map((policy, i) => {
          const slug = `${policies?.[0].slug}/${policy.policy}`
          return (
            <Fragment key={policy.policy}>
              {i > 0 && ' — '}
              <Link href={slug}>{policy.language}</Link>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
