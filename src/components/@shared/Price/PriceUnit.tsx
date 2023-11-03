import { ReactElement } from 'react'
import styles from './PriceUnit.module.css'
import { useUserPreferences } from '@context/UserPreferences'
import { formatNumber } from '@utils/numbers'

export default function PriceUnit({
  price,
  className,
  size = 'small',
  symbol,
  decimals,
  explicitZero
}: {
  price: number
  className?: string
  size?: 'small' | 'mini' | 'large'
  symbol?: string
  decimals?: string
  explicitZero?: boolean
}): ReactElement {
  const { locale } = useUserPreferences()

  return (
    <div className={`${styles.price} ${styles[size]} ${className}`}>
      {price === 0 && !explicitZero ? (
        <div>Free</div>
      ) : (!price && price !== 0) || Number.isNaN(price) ? (
        <div>-</div>
      ) : (
        <div>
          {Number.isNaN(price) ? '-' : formatNumber(price, locale, decimals)}{' '}
          <span className={styles.symbol}>{symbol}</span>
        </div>
      )}
    </div>
  )
}
