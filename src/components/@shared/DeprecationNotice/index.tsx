import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import ReactModal from 'react-modal'
import Markdown from '@shared/Markdown'
import Button from '@shared/atoms/Button'
import content from '../../../../content/deprecation.json'
import styles from './index.module.css'

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement('#__next')

const STORAGE_KEY = 'pontusXV1DeprecationAcknowledgedAt'
const CHECK_INTERVAL_MS = 30 * 1000

function getStoredAcknowledgedAt(): number {
  try {
    return Number(window.localStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

function storeAcknowledgedAt(timestamp: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(timestamp))
  } catch {
    // storage unavailable, the in-memory value keeps the acknowledgement
  }
}

// Persistent banner plus an interrupting modal that re-appears every
// `reminderIntervalMinutes`, so the notice also shows up during demos.
export default function DeprecationNotice(): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // fallback for when localStorage is blocked or throws
  const acknowledgedAtRef = useRef(0)
  const reminderIntervalMs = content.reminderIntervalMinutes * 60 * 1000

  const checkReminder = useCallback(() => {
    const acknowledgedAt = Math.max(
      getStoredAcknowledgedAt(),
      acknowledgedAtRef.current
    )
    if (Date.now() - acknowledgedAt >= reminderIntervalMs) setIsModalOpen(true)
  }, [reminderIntervalMs])

  useEffect(() => {
    if (!content.enabled) return
    checkReminder()
    const interval = setInterval(checkReminder, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [checkReminder])

  function acknowledge() {
    const now = Date.now()
    acknowledgedAtRef.current = now
    storeAcknowledgedAt(now)
    setIsModalOpen(false)
  }

  if (!content.enabled) return null

  return (
    <>
      <div
        className={styles.banner}
        role="region"
        aria-label={content.modal.title}
      >
        <span className={styles.icon} aria-hidden="true">
          !
        </span>
        <Markdown className={styles.text} text={content.banner.text} />
        <Button
          style="text"
          size="small"
          className={styles.action}
          onClick={() => setIsModalOpen(true)}
        >
          {content.banner.action}
        </Button>
      </div>

      <ReactModal
        isOpen={isModalOpen}
        contentLabel={content.modal.title}
        className={styles.modal}
        overlayClassName={styles.overlay}
        onRequestClose={acknowledge}
        shouldCloseOnOverlayClick={false}
      >
        <span className={styles.badge}>{content.modal.badge}</span>
        <h2 className={styles.title}>{content.modal.title}</h2>
        <Markdown className={styles.modalText} text={content.modal.text} />
        <Button
          style="primary"
          className={styles.confirm}
          onClick={acknowledge}
        >
          {content.modal.confirm}
        </Button>
      </ReactModal>
    </>
  )
}
