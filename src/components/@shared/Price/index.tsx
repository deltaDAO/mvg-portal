import { ReactElement } from 'react'
import { AssetPrice } from '@oceanprotocol/lib'
import PriceUnit from './PriceUnit'

export default function Price({
  price,
  orderPriceAndFees,
  className,
  size
}: {
  price: AssetPrice
  orderPriceAndFees?: OrderPriceAndFees
  className?: string
  size?: 'small' | 'mini' | 'large'
}): ReactElement {
  if (!price && !orderPriceAndFees) return
  return (
    <PriceUnit
      price={price?.value || Number(orderPriceAndFees?.price)}
      symbol={price?.tokenSymbol}
      className={className}
      size={size}
    />
  )
}
