import React, { ReactElement } from 'react'
import Markdown from '../../atoms/Markdown'
import VerifiedBadge from '../../atoms/VerifiedBadge'
import styles from './Visualizer.module.css'

export default function Visualizer({
  badgeLabel,
  text,
  title,
  displayBadge,
  invalidBadge,
  apiVersion
}: {
  badgeLabel: string
  text: string
  title: string
  displayBadge?: boolean
  invalidBadge?: boolean
  apiVersion?: string
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
      <Markdown text={text} />
    </div>
  )
}
