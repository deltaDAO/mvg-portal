import React, { ReactElement } from 'react'
import PriceUnit from './PriceUnit'

export default function Price({
  accessDetails,
  orderPriceAndFees,
  className,
  size
}: {
  accessDetails: AccessDetails
  orderPriceAndFees?: OrderPriceAndFees
  className?: string
  size?: 'small' | 'mini' | 'large'
}): ReactElement {
  const isSupported =
    accessDetails?.type === 'free' ||
    (accessDetails?.type === 'fixed' && accessDetails?.baseToken?.symbol)
  const price = `${orderPriceAndFees?.price || accessDetails?.price}`

  return isSupported ? (
    <PriceUnit
      price={Number(price)}
      symbol={accessDetails?.baseToken?.symbol}
      className={className}
      size={size}
      type={accessDetails?.type}
    />
  ) : null
}
