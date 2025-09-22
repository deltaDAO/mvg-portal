import { ReactElement } from 'react'
import styles from './index.module.css'

export interface LoaderProps {
  message?: string
  white?: boolean
  primary?: boolean
}

export default function Loader({
  message,
  white,
  primary
}: LoaderProps): ReactElement {
  const getLoaderClass = () => {
    if (white) return styles.white
    if (primary) return styles.primary
    return ''
  }

  return (
    <div className={styles.loaderWrap}>
      <span className={`${styles.loader} ${getLoaderClass()}`} />
      {message && <span className={styles.message}>{message}</span>}
    </div>
  )
}
