import { useEffect } from 'react'
import { FallbackProps } from 'react-error-boundary'
import { toast } from 'react-toastify'
import Button from '../atoms/Button'
import styles from './index.module.css'

function QueryErrorRetry({ error, resetErrorBoundary }: FallbackProps) {
  useEffect(() => {
    if (error.name === 'ZodValidationError') {
      console.warn(
        'Zod validation error (caught by ErrorBoundary):',
        error.cause
      )
    } else {
      console.error(error)
    }
    toast.error(error.message)
  }, [error])

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorTextContainer}>
        <span>There has been an error{error.message && ':'}</span>
        {error.message && <i className={styles.errorText}>{error.message}</i>}
      </div>
      <Button
        onClick={() => resetErrorBoundary()}
        style="text"
        size="small"
        className={styles.button}
      >
        Retry
      </Button>
    </div>
  )
}

export default QueryErrorRetry
