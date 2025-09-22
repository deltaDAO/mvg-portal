import styles from './SsiApiModal.module.css'

interface SsiApiModalProps {
  apiValue: string
  onChange: (value: string) => void
  onConnect: () => void
  onClose?: () => void
}

export default function SsiApiModal({
  apiValue,
  onChange,
  onConnect,
  onClose
}: SsiApiModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        )}
        <label>
          SSI Wallet API:
          <input
            type="text"
            value={apiValue}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <button className={styles.connectSsiButton} onClick={onConnect}>
          Set SSI Wallet API & Connect SSI
        </button>
      </div>
    </div>
  )
}
