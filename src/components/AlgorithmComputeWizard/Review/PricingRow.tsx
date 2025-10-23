import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import PriceDisplay from './PriceDisplay'
import Loader from '@shared/atoms/Loader'
import CircleCheck from '@images/circle_check.svg'
import CircleX from '@images/circle_x.svg'
import { useCredentialExpiration } from '@hooks/useCredentialExpiration'
import styles from './index.module.css'
import Alert from '@shared/atoms/Alert'

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
  credentialStatus?: 'verified' | 'checking' | 'failed' | 'unverified'
  assetId?: string
  serviceId?: string
  onCredentialRefresh?: () => void
  infoMessage?: string
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
  credentialStatus,
  assetId,
  serviceId,
  onCredentialRefresh,
  infoMessage
}: PricingRowProps): ReactElement {
  const {
    credentialStatus: expirationStatus,
    timeRemainingText,
    showExpirationWarning
  } = useCredentialExpiration(
    assetId || '',
    serviceId || '',
    onCredentialRefresh,
    credentialStatus === 'verified'
  )
  const renderCredentialStatus = () => {
    if (!credentialStatus) return null

    // Hide any status text until we actually have a valid timestamp
    if (credentialStatus === 'verified' && !expirationStatus.isValid)
      return null

    switch (credentialStatus) {
      case 'checking':
        return <Loader message="Checking credentials..." noMargin={true} />
      case 'verified':
        return (
          <div className={styles.credentialStatusContainer}>
            <CircleCheck className={styles.credentialIcon} />
            <span
              className={`${styles.verifiedText} ${
                showExpirationWarning ? styles.warningText : ''
              }`}
            >
              {timeRemainingText}
            </span>
            {expirationStatus.needsRefresh && (
              <Loader message="Checking..." noMargin={true} />
            )}
          </div>
        )
      case 'unverified':
        return null
      case 'failed':
        return (
          <div className={styles.credentialStatusContainer}>
            <CircleX className={styles.credentialIcon} />
            <span className={styles.verifiedText}>Credentials expired</span>
          </div>
        )
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
          {(() => {
            const shouldShowStatus =
              !!actionLabel &&
              (credentialStatus === 'checking' ||
                credentialStatus === 'failed' ||
                (credentialStatus === 'verified' && expirationStatus.isValid))
            return shouldShowStatus ? (
              <div className={styles.credentialIcon}>
                {renderCredentialStatus()}
              </div>
            ) : null
          })()}
        </div>
      </div>
      <div className={styles.priceInfo}>
        <PriceDisplay value={value} duration={duration} />
        {infoMessage && !actionLabel && (
          <div style={{ marginTop: '4px' }}>
            <Alert state="info">{infoMessage}</Alert>
          </div>
        )}
        {actionLabel && onAction && (
          <div style={{ marginTop: '4px' }}>
            <Button
              type="button"
              size="small"
              style="slim"
              onClick={onAction}
              disabled={
                actionDisabled ||
                (credentialStatus === 'verified' && expirationStatus.isValid)
              }
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
