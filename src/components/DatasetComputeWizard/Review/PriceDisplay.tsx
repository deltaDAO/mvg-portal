import { ReactElement } from 'react'
import styles from './index.module.css'

interface PriceDisplayProps {
  value: string | number
  symbol?: string
  duration?: string
}

export default function PriceDisplay({
  value,
  symbol = 'OCEAN',
  duration
}: PriceDisplayProps): ReactElement {
  return (
    <div className={styles.priceInfo}>
      <span className={styles.price}>
        <span className={styles.priceNumber}>{value}</span>
        <span className={styles.priceSymbol}> {symbol}</span>
      </span>
      {duration && <span className={styles.duration}>for {duration}</span>}
    </div>
  )
}
