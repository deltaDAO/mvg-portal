import { ReactElement } from 'react'
import styles from './index.module.css'

export default function StepTitle({ title }: { title: string }): ReactElement {
  return (
    <div className={styles.titleContainer}>
      <span className={styles.titleText}>{title}</span>
    </div>
  )
}
