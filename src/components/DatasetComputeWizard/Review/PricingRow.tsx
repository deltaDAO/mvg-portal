import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import PriceDisplay from './PriceDisplay'
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
  actionDisabled
}: PricingRowProps): ReactElement {
  return (
    <div className={`${styles.pricingRow} ${className || ''}`}>
      <div className={styles.itemInfo}>
        {label && <span className={styles.datasetLabel}>{label}</span>}
        <span className={isService ? styles.serviceName : styles.itemName}>
          {itemName}
        </span>
      </div>
      <div className={styles.priceInfo}>
        <PriceDisplay value={value} duration={duration} />
        {actionLabel && onAction && (
          <div style={{ marginTop: '4px' }}>
            <Button
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
