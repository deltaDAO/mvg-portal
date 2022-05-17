import React, { ReactElement } from 'react'
import { BestPrice } from '../../../../models/BestPrice'
import { useAsset } from '../../../../providers/Asset'
import Loader from '../../../atoms/Loader'
import PriceUnit from '../../../atoms/Price/PriceUnit'
import Tooltip from '../../../atoms/Tooltip'
import styles from './PriceOutput.module.css'

interface PriceOutputProps {
  totalPrice: number
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  symbol: string
  assetTimeout: string
  hasPreviousOrderSelectedComputeAsset: boolean
  hasDatatokenSelectedComputeAsset: boolean
  algorithmPrice: BestPrice
  selectedComputeAssetTimeout: string
  isLoading?: boolean
}

function Row({
  price,
  hasPreviousOrder,
  hasDatatoken,
  symbol,
  timeout,
  sign
}: {
  price: number
  hasPreviousOrder?: boolean
  hasDatatoken?: boolean
  symbol?: string
  timeout?: string
  sign?: string
}) {
  return (
    <div className={styles.priceRow}>
      <div className={styles.sign}>{sign}</div>
      <div>
        <PriceUnit
          price={hasPreviousOrder || hasDatatoken ? '0' : `${price}`}
          symbol={symbol}
          small
          className={styles.price}
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

export default function PriceOutput({
  totalPrice,
  hasPreviousOrder,
  hasDatatoken,
  assetTimeout,
  symbol,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  algorithmPrice,
  selectedComputeAssetTimeout,
  isLoading
}: PriceOutputProps): ReactElement {
  const { price } = useAsset()

  return (
    <div className={styles.priceComponent}>
      {isLoading ? (
        <div className={styles.loader}>
          <Loader message="Fetching assets total price" />
        </div>
      ) : (
        <>
          You will pay{' '}
          <PriceUnit price={`${totalPrice}`} symbol={symbol} small />
          <Tooltip
            content={
              <div className={styles.calculation}>
                <Row
                  hasPreviousOrder={hasPreviousOrder}
                  hasDatatoken={hasDatatoken}
                  price={price?.value}
                  timeout={assetTimeout}
                  symbol={symbol}
                />
                <Row
                  hasPreviousOrder={hasPreviousOrderSelectedComputeAsset}
                  hasDatatoken={hasDatatokenSelectedComputeAsset}
                  price={algorithmPrice?.value}
                  timeout={selectedComputeAssetTimeout}
                  symbol={symbol}
                  sign="+"
                />
                <Row price={totalPrice} symbol={symbol} sign="=" />
              </div>
            }
          />
        </>
      )}
    </div>
  )
}
