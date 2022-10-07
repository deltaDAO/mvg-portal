import React, { ReactElement } from 'react'
import Copy from '../../atoms/Copy'
import Markdown from '../../atoms/Markdown'
import VerifiedBadge from '../../atoms/VerifiedBadge'
import styles from './Visualizer.module.css'

export default function Visualizer({
  badgeLabel,
  text,
  title,
  displayBadge,
  invalidBadge,
  apiVersion,
  copyText
}: {
  badgeLabel: string
  text: string
  title: string
  displayBadge?: boolean
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
