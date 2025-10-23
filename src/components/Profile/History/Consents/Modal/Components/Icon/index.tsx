import { type ReactNode } from 'react'
import styles from './index.module.css'

interface IconProps {
  isDark?: boolean
  children: ReactNode
}

export const Icon = ({ isDark = true, children }: Readonly<IconProps>) => {
  return (
    <div
      className={`${styles.icon} ${
        isDark ? styles.darkIcon : styles.lightIcon
      }`}
    >
      {children}
    </div>
  )
}
