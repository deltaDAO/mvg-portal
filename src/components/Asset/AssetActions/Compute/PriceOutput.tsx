import { ReactElement } from 'react'
import { useAsset } from '@context/Asset'
import PriceUnit from '@shared/Price/PriceUnit'
import Tooltip from '@shared/atoms/Tooltip'
import styles from './PriceOutput.module.css'
import { MAX_DECIMALS } from '@utils/constants'
import Decimal from 'decimal.js'
import { Row } from '../Row'

interface PriceOutputProps {
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  symbol: string
  assetTimeout: string
  hasPreviousOrderSelectedComputeAsset: boolean
  hasDatatokenSelectedComputeAsset: boolean
  algorithmConsumeDetails: AccessDetails
  algorithmSymbol: string
  selectedComputeAssetTimeout: string
  datasetOrderPrice?: string
  algoOrderPrice?: string
  providerFeeAmount?: string
  providerFeesSymbol?: string
  validUntil?: string
  totalPrices?: totalPriceMap[]
  showInformation?: boolean
}

export default function PriceOutput({
  hasPreviousOrder,
  hasDatatoken,
  assetTimeout,
  symbol,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  algorithmConsumeDetails,
  algorithmSymbol,
  selectedComputeAssetTimeout,
  datasetOrderPrice,
  algoOrderPrice,
  providerFeeAmount,
  providerFeesSymbol,
  validUntil,
  totalPrices,
  showInformation
}: PriceOutputProps): ReactElement {
  const { asset } = useAsset()

  return (
    <div className={styles.priceComponent}>
      {totalPrices ? (
        totalPrices.length === 0 ? (
          showInformation && (
            <>Select an algorithm to calculate the Compute Job price</>
          )
        ) : (
          <>
            {totalPrices.every((price) => price.value === '0') ? (
              <>
                You can order this Compute Job for <strong>free</strong>
              </>
            ) : (
              <>
                You will pay{' '}
                {totalPrices
                  .filter((item) => item.value !== '0')
                  .map((item, index) => (
                    <div key={item.symbol}>
                      <PriceUnit
                        price={Number(item.value)}
                        symbol={item.symbol}
                        size="small"
                        explicitZero
                      />
                      {index <
                        totalPrices.filter((item) => item.value !== '0')
                          .length -
                          1 && <>&nbsp;{'&'}&nbsp;</>}
                    </div>
                  ))}
              </>
            )}
            {showInformation && (
              <Tooltip
                content={
                  <div className={styles.calculation}>
                    <Row
                      hasPreviousOrder={hasPreviousOrder}
                      hasDatatoken={hasDatatoken}
                      price={new Decimal(
                        datasetOrderPrice ||
                          asset?.accessDetails?.[0]?.price ||
                          0
                      )
                        .toDecimalPlaces(MAX_DECIMALS)
                        .toString()}
                      timeout={assetTimeout}
                      symbol={symbol}
                      type="DATASET"
                    />
                    <Row
                      hasPreviousOrder={hasPreviousOrderSelectedComputeAsset}
                      hasDatatoken={hasDatatokenSelectedComputeAsset}
                      price={new Decimal(
                        algoOrderPrice || algorithmConsumeDetails?.price || 0
                      )
                        .toDecimalPlaces(MAX_DECIMALS)
                        .toString()}
                      timeout={selectedComputeAssetTimeout}
                      symbol={algorithmSymbol}
                      sign="+"
                      type="ALGORITHM"
                    />
                    <Row
                      price={providerFeeAmount} // initializeCompute.provider fee amount
                      timeout={`${validUntil} seconds`} // valid until value
                      symbol={providerFeesSymbol} // we assume that provider fees will always be in OCEAN token
                      sign="+"
                      type="C2D RESOURCES"
                    />
                    {totalPrices.map((item, index) => (
                      <Row
                        price={item.value}
                        symbol={item.symbol}
                        sign={index === 0 ? '=' : '&'}
                        key={item.symbol}
                      />
                    ))}
                  </div>
                }
              />
            )}
          </>
        )
      ) : (
        <>The price will be calculated once you select an algorithm.</>
      )}
    </div>
  )
}
