import { ReactElement } from 'react'
import styles from './index.module.css'

export interface LoaderProps {
  message?: string
  variant?: 'white' | 'primary' | 'default'
  className?: string
  noMargin?: boolean
}

export default function Loader({
  message,
  variant = 'default',
  className,
  noMargin = false
}: LoaderProps): ReactElement {
  const getLoaderClass = () => {
    switch (variant) {
      case 'white':
        return styles.white
      case 'primary':
        return styles.primary
      default:
        return ''
    }
  }

  return (
    <div
      className={`${styles.loaderWrap} ${className || ''} ${
        noMargin ? '' : styles.marginTop
      }`}
    >
      <span className={`${styles.loader} ${getLoaderClass()}`} />
      {message && <span className={styles.message}>{message}</span>}
    </div>
  )
}
