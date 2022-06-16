import React, { ReactElement } from 'react'
import Markdown from '../../atoms/Markdown'
import VerifiedBadge from '../../atoms/VerifiedBadge'
import styles from './Visualizer.module.css'

export default function Visualizer({
  badgeLabel,
  text,
  title,
  displayBadge,
  invalidBadge
}: {
  badgeLabel: string
  text: string
  title: string
  displayBadge?: boolean
  invalidBadge?: boolean
}): ReactElement {
  return (
    <div>
      <div className={styles.header}>
        <h4>{title}</h4>
        {displayBadge && (
          <VerifiedBadge isInvalid={invalidBadge} text={badgeLabel} timestamp />
        )}
      </div>
      <Markdown text={text} />
    </div>
  )
}
