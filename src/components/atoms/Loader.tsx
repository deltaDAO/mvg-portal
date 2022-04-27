import React, { ReactElement } from 'react'
import styles from './Loader.module.css'

export default function Loader({
  message,
  useDefaultMessage
}: {
  message?: string
  useDefaultMessage?: boolean
}): ReactElement {
  const displayMessage = message || 'Loading...'

  return (
    <div className={styles.loaderWrap}>
      <span className={styles.loader} />
      {(message || useDefaultMessage) && (
        <span className={styles.message}>{displayMessage}</span>
      )}
    </div>
  )
}
