import { ReactElement } from 'react'
import SuccessConfetti from '@shared/SuccessConfetti'
import Button from '@shared/atoms/Button'

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
            <p>
              <strong>Job ID:</strong> {jobId}
            </p>
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
