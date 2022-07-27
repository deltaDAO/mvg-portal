import React, { ReactElement } from 'react'
import styles from './Loader.module.css'

export default function Loader({
  message,
  useDefaultMessage,
  style = 'spinner',
  dimensions
}: {
  message?: string
  useDefaultMessage?: boolean
  style?: 'spinner' | 'gradient'
  dimensions?: { width: number; height: number }
}): ReactElement {
  const displayMessage = message || 'Loading...'

  return style === 'spinner' ? (
    <div className={styles.loaderWrap}>
      <span className={styles.loader} />
      {(message || useDefaultMessage) && (
        <span className={styles.message}>{displayMessage}</span>
      )}
    </div>
  ) : (
    <div
      className={styles.placeholder}
      style={{ width: dimensions?.width, height: dimensions?.height }}
    >
      <div
        className={styles.animatedBackground}
        style={{
          height: dimensions?.height,
          backgroundSize: `${dimensions?.width * 10}px ${dimensions?.height}px`
        }}
      />
    </div>
  )
}
