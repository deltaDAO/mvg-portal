import { ReactElement } from 'react'
import Loader from '@shared/atoms/Loader'
import styles from './LoaderOverlay.module.css'

interface LoaderOverlayProps {
  visible: boolean
  message?: string
}

export default function LoaderOverlay({
  visible,
  message
}: LoaderOverlayProps): ReactElement {
  return (
    <div
      className={`${styles.overlay} ${visible ? styles.visible : ''}`}
      aria-busy={visible}
    >
      {visible && <Loader message={message || 'Loading...'} />}
    </div>
  )
}
