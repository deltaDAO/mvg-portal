import React, { ReactElement } from 'react'
import Copy from '../atoms/Copy'
import Markdown from '../Markdown'
import VerifiedBadge from '../VerifiedBadge'
import styles from './index.module.css'

export default function Visualizer({
  text,
  title,
  displayBadge,
  badgeLabel,
  invalidBadge,
  apiVersion,
  copyText
}: {
  text: string
  title: string
  displayBadge?: boolean
  badgeLabel?: string
  invalidBadge?: boolean
  apiVersion?: string
  copyText?: string
}): ReactElement {
  return (
    <div>
      <div className={styles.header}>
        <h4>{title}</h4>
        {displayBadge && (
          <VerifiedBadge
            isInvalid={invalidBadge}
            text={badgeLabel}
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
