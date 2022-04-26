import React, { ReactElement } from 'react'
import styles from './Loader.module.css'

export default function Loader({
  message,
  spinnerOnly
}: {
  message?: string
  spinnerOnly?: boolean
}): ReactElement {
  const displayMessage = message || 'Loading...'

  return (
    <div className={styles.loaderWrap}>
      <span className={styles.loader} />
      {!spinnerOnly && <span className={styles.message}>{displayMessage}</span>}
    </div>
  )
}
