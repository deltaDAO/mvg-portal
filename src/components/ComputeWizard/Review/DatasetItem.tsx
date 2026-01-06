import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import CircleCheckIcon from '@images/circle_check.svg'
import styles from './DatasetItem.module.css'

interface DatasetItemProps {
  dataset?: any
  onCheckCredentials?: (datasetId: string) => void
  showVerifiedBadge?: boolean
}

export default function DatasetItem({
  dataset,
  onCheckCredentials,
  showVerifiedBadge
}: DatasetItemProps): ReactElement {
  const handleCredentialCheck = () => {
    onCheckCredentials?.(dataset.id)
  }

  const getCredentialButtonText = () => {
    if (dataset?.credentialsStatus === 'valid') {
      return 'Credentials valid for 5 minutes'
    }
    return 'Check Credentials'
  }

  const renderStatus = () => {
    if (!onCheckCredentials) return null
    if (dataset?.credentialsStatus === 'valid') {
      return (
        <div className={styles.credentialStatus}>
          <CircleCheckIcon className={styles.checkIcon} />
          <span className={styles.validText}>{getCredentialButtonText()}</span>
        </div>
      )
    }
    return (
      <Button
        type="button"
        size="small"
        style="slim"
        onClick={handleCredentialCheck}
      >
        {getCredentialButtonText()}
      </Button>
    )
  }

  return (
    <div className={styles.datasetItem}>
      <div className={styles.datasetHeader}>
        <span className={styles.datasetName}>{dataset?.name}</span>
        {renderStatus()}
        {showVerifiedBadge && dataset?.credentialsStatus === 'valid' && (
          <span className={styles.verifiedBadge}>
            <CircleCheckIcon className={styles.checkIcon} /> Verified
          </span>
        )}
      </div>
    </div>
  )
}
