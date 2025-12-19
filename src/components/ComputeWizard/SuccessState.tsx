import { ReactElement } from 'react'
import SuccessConfetti from '@shared/SuccessConfetti'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import { CopyToClipboard } from '@shared/CopyToClipboard'

interface SuccessStateProps {
  jobId?: string
  onContinue: () => void
  containerClassName?: string
  detailsClassName?: string
  jobIdContainerClassName?: string
  buttonClassName?: string
}

export default function SuccessState({
  jobId,
  onContinue,
  containerClassName,
  detailsClassName,
  jobIdContainerClassName,
  buttonClassName
}: SuccessStateProps): ReactElement {
  return (
    <div className={containerClassName}>
      <SuccessConfetti success="Job Started Successfully!" />
      <div className={detailsClassName}>
        <h3>Compute Job Started!</h3>
        <p>Your compute job is now running and processing your data.</p>
        {jobId && jobId !== 'N/A' && (
          <div className={jobIdContainerClassName}>
            <div className={styles.jobIdRow}>
              <strong>Job ID:</strong>
              <CopyToClipboard
                value={jobId}
                truncate={8}
                className={styles.jobIdCopy}
                textClassName={styles.jobIdValue}
                showCopyButton
                copyButtonLabel="Copy"
              />
            </div>
          </div>
        )}
        <p>
          You can monitor the progress in your profile or on the asset page.
        </p>
        <p>Please close this wizard to continue.</p>
        <Button
          style="gradient"
          className={buttonClassName}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
