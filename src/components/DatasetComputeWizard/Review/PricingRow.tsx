import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import PriceDisplay from './PriceDisplay'
import Loader from '@shared/atoms/Loader'
import CircleCheck from '@images/circle_check.svg'
import CircleX from '@images/circle_x.svg'
import styles from './index.module.css'

interface PricingRowProps {
  itemName: string
  label?: string
  value: string | number
  duration?: string
  className?: string
  isService?: boolean
  actionLabel?: string
  onAction?: () => void
  actionDisabled?: boolean
  credentialStatus?: 'pending' | 'verified' | 'error' | 'checking'
}

export default function PricingRow({
  itemName,
  label,
  value,
  duration,
  className,
  isService = false,
  actionLabel,
  onAction,
  actionDisabled,
  credentialStatus
}: PricingRowProps): ReactElement {
  const renderCredentialStatus = () => {
    if (!credentialStatus) return null

    switch (credentialStatus) {
      case 'checking':
        return <Loader message="Checking credentials..." noMargin={true} />
      case 'verified':
        return (
          <div className={styles.credentialStatusContainer}>
            <CircleCheck className={styles.credentialIcon} />
            <span className={styles.verifiedText}>
              Credentials valid for 5 minutes
            </span>
          </div>
        )
      case 'error':
        return <CircleX className={styles.credentialIcon} />
      case 'pending':
      default:
        return null
    }
  }

  return (
    <div className={`${styles.pricingRow} ${className || ''}`}>
      <div className={styles.itemInfo}>
        {label && <span className={styles.datasetLabel}>{label}</span>}
        <div className={styles.itemNameContainer}>
          <span className={isService ? styles.serviceName : styles.itemName}>
            {itemName}
          </span>
          <div className={styles.credentialIcon}>
            {renderCredentialStatus()}
          </div>
        </div>
      </div>
      <div className={styles.priceInfo}>
        <PriceDisplay value={value} duration={duration} />
        {actionLabel && onAction && (
          <div style={{ marginTop: '4px' }}>
            <Button
              type="button"
              size="small"
              style="slim"
              onClick={onAction}
              disabled={actionDisabled}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
