import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import CircleCheckIcon from '@images/circle_check.svg'
import styles from './DatasetItem.module.css'

interface DatasetItemProps {
  dataset: {
    id: string
    name: string
    services: Array<{
      id: string
      name: string
      price: string
      duration: string
    }>
    credentialsStatus: 'pending' | 'valid' | 'invalid'
    credentialsValidUntil?: Date
  }
  onCheckCredentials: (datasetId: string) => void
}

export default function DatasetItem({
  dataset,
  onCheckCredentials
}: DatasetItemProps): ReactElement {
  const handleCredentialCheck = () => {
    onCheckCredentials(dataset.id)
  }

  const getCredentialButtonText = () => {
    if (dataset.credentialsStatus === 'valid') {
      return 'Credentials valid for 5 minutes'
    }
    return 'Check Credentials'
  }

  return (
    <div className={styles.datasetItem}>
      <div className={styles.datasetHeader}>
        <span className={styles.datasetName}>{dataset.name}</span>
        {dataset.credentialsStatus === 'valid' ? (
          <div className={styles.credentialStatus}>
            <CircleCheckIcon className={styles.checkIcon} />
            <span className={styles.validText}>
              {getCredentialButtonText()}
            </span>
          </div>
        ) : (
          <Button size="small" style="slim" onClick={handleCredentialCheck}>
            {getCredentialButtonText()}
          </Button>
        )}
      </div>
    </div>
  )
}
