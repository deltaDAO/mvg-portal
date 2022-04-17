import React, { ReactElement } from 'react'
import styles from './StepBody.module.css'
import Markdown from '../../atoms/Markdown'
import { ReactNode } from 'react-markdown'

export default function StepBody({
  body,
  image,
  children
}: {
  body: string
  image: string
  children?: ReactNode
}): ReactElement {
  return (
    <div className={styles.content}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <Markdown text={body} className={styles.paragraph} />
          <div className={styles.actions}>{children}</div>
        </div>
      </div>
      {image && <img src={image} className={styles.image} />}
    </div>
  )
}
