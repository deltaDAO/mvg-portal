import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Modal from '@shared/atoms/Modal'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'

interface ComputeJobSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  jobId?: string
  algorithmName?: string
  datasetNames?: string[]
  totalCost?: string
  assetDid?: string
}

export default function ComputeJobSuccessModal({
  isOpen,
  onClose,
  jobId,
  algorithmName,
  datasetNames,
  totalCost,
  assetDid
}: ComputeJobSuccessModalProps): ReactElement {
  const router = useRouter()

  const handleClose = () => {
    onClose()
    // Navigate back to asset page with refresh trigger
    if (assetDid) {
      router.push(`/asset/${assetDid}?refreshJobs=true`)
    }
  }

  return (
    <Modal
      title="Job Started Successfully!"
      isOpen={isOpen}
      onToggleModal={handleClose}
    >
      <div className={styles.content}>
        <div className={styles.successMessage}>
          Your compute job has been started successfully! Watch the progress
          below or on your profile.
        </div>

        {jobId && (
          <div className={styles.jobDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Job ID:</span>
              <span className={styles.value}>{jobId}</span>
            </div>

            {algorithmName && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Algorithm:</span>
                <span className={styles.value}>{algorithmName}</span>
              </div>
            )}

            {datasetNames && datasetNames.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Datasets:</span>
                <span className={styles.value}>{datasetNames.join(', ')}</span>
              </div>
            )}

            {totalCost && (
              <div className={styles.detailRow}>
                <span className={styles.label}>Total Cost:</span>
                <span className={styles.value}>{totalCost}</span>
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            style="primary"
            onClick={handleClose}
            className={styles.closeButton}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
