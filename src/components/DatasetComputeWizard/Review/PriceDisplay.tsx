import { ReactElement } from 'react'
import styles from './index.module.css'

interface PriceDisplayProps {
  value: string | number
  symbol?: string
  duration?: string
  valueType?: 'escrow' | 'deposit' | 'default'
}

export default function PriceDisplay({
  value,
  symbol = 'OCEAN',
  duration,
  valueType = 'default'
}: PriceDisplayProps): ReactElement {
  const numericValue = Number(value)

  let colorClass = ''
  if (valueType === 'escrow' && numericValue !== 0) {
    colorClass = 'greenValue'
  } else if (valueType === 'deposit' && numericValue !== 0) {
    colorClass = 'redValue'
  }

  return (
    <div className={styles.priceInfo}>
      <span className={styles.price}>
        <span className={`${styles.priceNumber} ${styles[colorClass] || ''}`}>
          {Number(value).toFixed(3)}
        </span>
        <span className={styles.priceSymbol}> {symbol}</span>
      </span>
      {duration && (
        <span className={styles.duration}>
          for {duration === '0s' ? 'forever' : duration}
        </span>
      )}
    </div>
  )
}
