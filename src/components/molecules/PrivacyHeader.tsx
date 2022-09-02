import React, { ReactElement } from 'react'
import styles from '../templates/PageMarkdown.module.css'
import { usePrivacyMetadata } from '../../hooks/usePrivacyMetadata'
import PrivacyLanguages from '../atoms/PrivacyLanguages'

export default function PrivacyPolicyHeader({
  tableOfContents,
  policy
}: {
  tableOfContents: string
  policy: string
}): ReactElement {
  const { policies } = usePrivacyMetadata()
  const policyMetadata = policies.find((p) => p.policy === policy)
  const { params } = policyMetadata

  return (
    <div>
      <PrivacyLanguages label={params.languageLabel} />
      <div className={styles.content}>
        <h1>{params?.tocHeader || 'Table of Contents'}</h1>
        <div
          className={styles.tocList}
          dangerouslySetInnerHTML={{ __html: tableOfContents }}
        />
      </div>
    </div>
  )
}
