import Button from '@components/@shared/atoms/Button'
import styles from './index.module.css'

interface ActionsProps {
  handleAccept?: () => void
  handleReject?: () => void
  acceptText?: string
  rejectText?: string
  isLoading?: boolean
}

export default function Actions({
  handleAccept,
  handleReject,
  acceptText,
  rejectText,
  isLoading
}: ActionsProps) {
  return (
    <div className={styles.actions}>
      {handleReject && (
        <Button
          size="small"
          name="action"
          className={`${styles.action} ${styles.reject}`}
          onClick={handleReject}
          type="button"
          disabled={isLoading}
        >
          {rejectText ?? 'Reject'}
        </Button>
      )}
      <Button
        size="small"
        name="action"
        className={`${styles.action} ${styles.confirm}`}
        onClick={handleAccept}
        type="button"
        disabled={isLoading}
      >
        {acceptText ?? 'Accept'}
      </Button>
    </div>
  )
}
