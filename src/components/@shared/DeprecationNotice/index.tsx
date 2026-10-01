import { ReactElement, useCallback, useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Markdown from '@shared/Markdown'
import Button from '@shared/atoms/Button'
import content from '../../../../content/deprecation.json'
import styles from './index.module.css'

if (process.env.NODE_ENV !== 'test') ReactModal.setAppElement('#__next')

const STORAGE_KEY = 'pontusXV1DeprecationAcknowledgedAt'
const CHECK_INTERVAL_MS = 30 * 1000

function getAcknowledgedAt(): number {
  try {
    return Number(window.sessionStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

function setAcknowledgedAt(timestamp: number): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(timestamp))
  } catch {
    // storage unavailable, modal will simply show again on next check
  }
}

// Persistent banner plus an interrupting modal that re-appears every
// `reminderIntervalMinutes`, so the notice also shows up during demos.
export default function DeprecationNotice(): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const reminderIntervalMs = content.reminderIntervalMinutes * 60 * 1000

  const checkReminder = useCallback(() => {
    if (Date.now() - getAcknowledgedAt() >= reminderIntervalMs)
      setIsModalOpen(true)
  }, [reminderIntervalMs])

  useEffect(() => {
    if (!content.enabled) return
    checkReminder()
    const interval = setInterval(checkReminder, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [checkReminder])

  function acknowledge() {
    setAcknowledgedAt(Date.now())
    setIsModalOpen(false)
  }

  if (!content.enabled) return null

  return (
    <>
      <div className={styles.banner} role="alert">
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
