import { ReactElement } from 'react'
import PriceDisplay from './PriceDisplay'
import styles from './index.module.css'

interface PricingRowProps {
  itemName: string
  value: string | number
  duration?: string
  className?: string
  isService?: boolean
}

export default function PricingRow({
  itemName,
  value,
  duration,
  className,
  isService = false
}: PricingRowProps): ReactElement {
  return (
    <div className={`${styles.pricingRow} ${className || ''}`}>
      <div className={styles.itemInfo}>
        <span className={isService ? styles.serviceName : styles.itemName}>
          {itemName}
        </span>
      </div>
      <PriceDisplay value={value} duration={duration} />
    </div>
  )
}
