import React, { ReactElement } from 'react'
import Markdown from '../atoms/Markdown'
import styles from './SectionTitle.module.css'

export interface SectionTitleData {
  title: string
  subtitle?: string
  body?: string
}

export default function SectionTitle({
  title,
  subtitle,
  body
}: SectionTitleData): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {subtitle && <h5 className={styles.subtitle}>{subtitle}</h5>}
        <h2 className={styles.title}>{title}</h2>
        {body && <Markdown text={body} className={styles.paragraph} />}
      </div>
    </div>
  )
}
