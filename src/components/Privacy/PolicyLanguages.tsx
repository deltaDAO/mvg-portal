import { Fragment, ReactElement } from 'react'
import styles from './PolicyLanguages.module.css'
import { UsePolicyMetadata } from '@hooks/usePolicyMetadata'
import Link from 'next/link'

export default function PolicyLanguages({
  label,
  policiesMetadata
}: {
  label?: string
  policiesMetadata: UsePolicyMetadata
}): ReactElement {
  const { policies } = policiesMetadata
  return (
    <div className={styles.langSelect}>
      <span className={styles.langLabel}>{label || 'Language'}</span>
      <div className={styles.langOptions}>
        {policies.map((policy, i) => {
          const slug = `${policiesMetadata.slug}/${policy.policyLangTag}`
          return (
            <Fragment key={policy.policyLangTag}>
              {i > 0 && ' — '}
              <Link href={slug}>{policy.language}</Link>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
