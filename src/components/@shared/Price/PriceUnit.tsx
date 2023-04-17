import React, { ReactElement } from 'react'
import styles from './PriceUnit.module.css'
import { useUserPreferences } from '@context/UserPreferences'
import { formatNumber } from '@utils/numbers'

export default function PriceUnit({
  price,
  className,
  size = 'small',
  symbol,
  decimals
}: {
  price: number
  className?: string
  size?: 'small' | 'mini' | 'large'
  symbol?: string
  decimals?: string
}): ReactElement {
  const { locale } = useUserPreferences()

  return (
    <div className={`${styles.price} ${styles[size]} ${className}`}>
      {price === 0 ? (
        <div>Free</div>
      ) : !price || Number.isNaN(price) ? (
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
