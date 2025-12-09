import { ReactElement } from 'react'
import styles from './index.module.css'

export interface StatusTagProps {
  type: 'free' | 'paid'
  children: React.ReactNode
  className?: string
}

export default function StatusTag({
  type,
  children,
  className
}: StatusTagProps): ReactElement {
  return (
    <span className={`${styles.statusTag} ${styles[type]} ${className || ''}`}>
      {children}
    </span>
  )
}
