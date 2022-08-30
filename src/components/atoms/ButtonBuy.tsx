import { graphql, useStaticQuery } from 'gatsby'
import React, { FormEvent, ReactElement } from 'react'
import Alert from './Alert'
import Button from './Button'
import styles from './ButtonBuy.module.css'
import Loader from './Loader'

const query = graphql`
  query {
    content: allFile(
      filter: { relativePath: { eq: "assetDisclaimers.json" } }
    ) {
      edges {
        node {
          childContentJson {
            edgeDeviceUnavailableMessage
            disclaimerMessage
          }
        }
      }
    }
  }
`

interface DisclaimerData {
  content: {
    edges: {
      node: {
        childContentJson: {
          edgeDeviceUnavailableMessage: string
          disclaimerMessage: string
        }
      }
    }[]
  }
}

interface ButtonBuyProps {
  action: 'download' | 'compute'
  disabled: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtSymbol: string
  dtBalance: string
  datasetLowPoolLiquidity: boolean
  assetType: string
  assetTimeout: string
  isConsumable: boolean
  consumableFeedback: string
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  dtSymbolSelectedComputeAsset?: string
  dtBalanceSelectedComputeAsset?: string
  selectedComputeAssetLowPoolLiquidity?: boolean
  selectedComputeAssetType?: string
  isBalanceSufficient: boolean
  isLoading: boolean
  onClick?: (e: FormEvent<HTMLButtonElement>) => void
  stepText?: string
  type?: 'submit'
  priceType?: string
  algorithmPriceType?: string
  algorithmConsumableStatus?: number
  isEdgeDeviceUnavailable?: boolean
}

function getConsumeHelpText(
  dtBalance: string,
  dtSymbol: string,
  hasDatatoken: boolean,
  hasPreviousOrder: boolean,
  lowPoolLiquidity: boolean,
  assetType: string,
  isConsumable: boolean,
  isBalanceSufficient: boolean,
  consumableFeedback: string
) {
  const text =
    isConsumable === false
      ? consumableFeedback
      : hasPreviousOrder
      ? `You bought this ${assetType} already allowing you to use it without paying again.`
      : hasDatatoken
      ? `You own ${dtBalance} ${dtSymbol} allowing you to use this data set by spending 1 ${dtSymbol}, but without paying OCEAN again.`
      : lowPoolLiquidity
      ? `There are not enought ${dtSymbol} available in the pool for the transaction to take place`
      : isBalanceSufficient === false
      ? 'You do not have enough OCEAN in your wallet to purchase this asset.'
      : `For using this ${assetType}, you will buy 1 ${dtSymbol} and immediately spend it back to the publisher and pool.`
  return text
}

function getComputeAssetHelpText(
  hasPreviousOrder: boolean,
  hasDatatoken: boolean,
  dtSymbol: string,
  dtBalance: string,
  lowPoolLiquidity: boolean,
  assetType: string,
  isConsumable: boolean,
  consumableFeedback: string,
  isBalanceSufficient: boolean,
  hasPreviousOrderSelectedComputeAsset?: boolean,
  hasDatatokenSelectedComputeAsset?: boolean,
  dtSymbolSelectedComputeAsset?: string,
  dtBalanceSelectedComputeAsset?: string,
  selectedComputeAssettLowPoolLiquidity?: boolean,
  selectedComputeAssetType?: string,
  algorithmConsumableStatus?: number
) {
  const computeAssetHelpText = getConsumeHelpText(
    dtBalance,
    dtSymbol,
    hasDatatoken,
    hasPreviousOrder,
    lowPoolLiquidity,
    assetType,
    isConsumable,
    isBalanceSufficient,
    consumableFeedback
  )
  const computeAlgoHelpText =
    (!dtSymbolSelectedComputeAsset && !dtBalanceSelectedComputeAsset) ||
    isConsumable === false ||
    algorithmConsumableStatus > 0
      ? ''
      : hasPreviousOrderSelectedComputeAsset
      ? `You already bought the selected ${selectedComputeAssetType}, allowing you to use it without paying again.`
      : hasDatatokenSelectedComputeAsset
      ? `You own ${dtBalanceSelectedComputeAsset} ${dtSymbolSelectedComputeAsset} allowing you to use the selected ${selectedComputeAssetType} by spending 1 ${dtSymbolSelectedComputeAsset}, but without paying OCEAN again.`
      : selectedComputeAssettLowPoolLiquidity
      ? `There are not enought ${dtSymbolSelectedComputeAsset} available in the pool for the transaction to take place`
      : isBalanceSufficient === false
      ? ''
      : `Additionally, you will buy 1 ${dtSymbolSelectedComputeAsset} for the ${selectedComputeAssetType} and spend it back to its publisher and pool.`
  const computeHelpText = selectedComputeAssettLowPoolLiquidity
    ? computeAlgoHelpText
    : lowPoolLiquidity
    ? computeAssetHelpText
    : `${computeAssetHelpText} ${computeAlgoHelpText}`
  return computeHelpText
}
function getAlgorithmConsumableStatusHelpText(
  algorithmConsumableStatus: number
) {
  return algorithmConsumableStatus === 1
    ? 'The selected algorithm has been temporarily disabled by the publisher, please try again later.'
    : algorithmConsumableStatus === 2
    ? 'Access denied, your wallet address is not found on the selected algorithm allow list.'
    : algorithmConsumableStatus === 3
    ? 'Access denied, your wallet address is found on the selected algorithm deny list.'
    : 'The selected algorithm is currently not available. You may try again later.'
}

export default function ButtonBuy({
  action,
  disabled,
  hasPreviousOrder,
  hasDatatoken,
  dtSymbol,
  dtBalance,
  datasetLowPoolLiquidity,
  assetType,
  assetTimeout,
  isConsumable,
  consumableFeedback,
  isBalanceSufficient,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  dtSymbolSelectedComputeAsset,
  dtBalanceSelectedComputeAsset,
  selectedComputeAssetLowPoolLiquidity,
  selectedComputeAssetType,
  onClick,
  stepText,
  isLoading,
  type,
  priceType,
  algorithmPriceType,
  algorithmConsumableStatus,
  isEdgeDeviceUnavailable
}: ButtonBuyProps): ReactElement {
  const data: DisclaimerData = useStaticQuery(query)
  const { edgeDeviceUnavailableMessage, disclaimerMessage } =
    data.content.edges[0].node.childContentJson

  const buttonText =
    action === 'download'
      ? hasPreviousOrder
        ? 'Download'
        : priceType === 'free'
        ? 'Get'
        : `Buy ${assetTimeout === 'Forever' ? '' : ` for ${assetTimeout}`}`
      : hasPreviousOrder && hasPreviousOrderSelectedComputeAsset
      ? 'Start Compute Job'
      : priceType === 'free' && algorithmPriceType === 'free'
      ? 'Order Compute Job'
      : `Buy Compute Job`

  return (
    <div className={styles.actions}>
      {isLoading ? (
        <Loader message={stepText} />
      ) : (
        <>
          <div className={styles.warning}>
            {action === 'compute' && algorithmConsumableStatus > 0 && (
              <Alert
                text={getAlgorithmConsumableStatusHelpText(
                  algorithmConsumableStatus
                )}
                state="warning"
              />
            )}
          </div>
          <Button
            style="primary"
            type={type}
            onClick={onClick}
            disabled={disabled}
          >
            {buttonText}
          </Button>
          <div className={styles.help}>
            {action === 'download'
              ? getConsumeHelpText(
                  dtBalance,
                  dtSymbol,
                  hasDatatoken,
                  hasPreviousOrder,
                  datasetLowPoolLiquidity,
                  assetType,
                  isConsumable,
                  isBalanceSufficient,
                  consumableFeedback
                )
              : getComputeAssetHelpText(
                  hasPreviousOrder,
                  hasDatatoken,
                  dtSymbol,
                  dtBalance,
                  datasetLowPoolLiquidity,
                  assetType,
                  isConsumable,
                  consumableFeedback,
                  isBalanceSufficient,
                  hasPreviousOrderSelectedComputeAsset,
                  hasDatatokenSelectedComputeAsset,
                  dtSymbolSelectedComputeAsset,
                  dtBalanceSelectedComputeAsset,
                  selectedComputeAssetLowPoolLiquidity,
                  selectedComputeAssetType,
                  algorithmConsumableStatus
                )}
            <Alert
              text={
                isEdgeDeviceUnavailable
                  ? edgeDeviceUnavailableMessage
                  : disclaimerMessage
              }
              state="warning"
            />
          </div>
        </>
      )}
    </div>
  )
}
