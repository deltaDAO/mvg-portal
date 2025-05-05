import { ReactElement } from 'react'
import styles from './StepHeader.module.css'

export default function StepHeader({
  title,
  subtitle
}: {
  title: string
  subtitle: string
}): ReactElement {
  return (
    <div className={styles.header}>
      <h3 className={styles.title}>{title}</h3>
      <h5 className={styles.subtitle}>{subtitle}</h5>
    </div>
  )
}
