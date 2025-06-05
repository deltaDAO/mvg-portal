import { ReactElement, ReactNode } from 'react'
import styles from './SectionContainer.module.css'

interface SectionContainerProps {
  title: string
  children: ReactNode
  className?: string
  required?: boolean
}

export default function SectionContainer({
  title,
  children,
  className,
  required = false
}: SectionContainerProps): ReactElement {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.label}>
        {title}
        {required && <span className={styles.required}>*</span>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
