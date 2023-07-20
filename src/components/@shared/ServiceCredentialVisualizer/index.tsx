import React, { ReactElement } from 'react'
import Copy from '../atoms/Copy'
import Markdown from '../Markdown'
import VerifiedBadge from '../VerifiedBadge'
import styles from './index.module.css'

export default function ServiceCredentialVisualizer({
  text,
  title,
  displayBadge,
  isValid,
  idMatch,
  apiVersion,
  copyText
}: {
  text: string
  title: string
  displayBadge?: boolean
  isValid?: boolean
  idMatch?: boolean
  apiVersion?: string
  copyText?: string
}): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h5>{title}</h5>
        {displayBadge && (
          <VerifiedBadge
            isValid={isValid}
            idMatch={idMatch}
            apiVersion={apiVersion}
            timestamp
          />
        )}
      </div>
      <div className={styles.markdownContainer}>
        <Markdown text={text} />
        {copyText && (
          <div className={styles.copyContainer}>
            <Copy text={copyText} />
          </div>
        )}
      </div>
    </div>
  )
}
