import PriceUnit from '@components/@shared/Price/PriceUnit'
import styles from './row.module.css'

export function Row({
  price,
  hasPreviousOrder,
  hasDatatoken,
  symbol,
  timeout,
  sign,
  type
}: {
  price: string
  hasPreviousOrder?: boolean
  hasDatatoken?: boolean
  symbol?: string
  timeout?: string
  sign?: string
  type?: string
}) {
  return (
    <div className={styles.priceRow}>
      <div className={styles.sign}>{sign}</div>
      <div className={styles.type}>{type}</div>
      <div className={styles.priceColumn}>
        <PriceUnit
          price={hasPreviousOrder || hasDatatoken ? 0 : Number(price)}
          symbol={symbol}
          size="mini"
          className={styles.price}
          explicitZero
        />
        <span className={styles.timeout}>
          {timeout &&
            timeout !== 'Forever' &&
            !hasPreviousOrder &&
            `for ${timeout}`}
        </span>
      </div>
    </div>
  )
}
