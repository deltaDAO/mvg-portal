import { FormEvent, ReactElement } from 'react'
import Button from '../../../@shared/atoms/Button'
import styles from './index.module.css'
import Loader from '../../../@shared/atoms/Loader'
import Download2SVG from '@images/download2.svg'

export interface ButtonBuyProps {
  action: 'download' | 'compute'
  disabled: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  btSymbol: string
  dtSymbol: string
  dtBalance: string
  assetType: string
  assetTimeout: string
  isConsumable: boolean
  consumableFeedback: string
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  dtSymbolSelectedComputeAsset?: string
  dtBalanceSelectedComputeAsset?: string
  selectedComputeAssetType?: string
  isBalanceSufficient: boolean
  isLoading?: boolean
  onClick?: (e: FormEvent<HTMLButtonElement>) => void
  stepText?: string
  type?: 'submit' | 'button'
  priceType?: string
  algorithmPriceType?: string
  isAlgorithmConsumable?: boolean
  isSupportedOceanNetwork?: boolean
  isAccountConnected?: boolean
  hasProviderFee?: boolean
  retry?: boolean
  computeWizard?: boolean
}

function getConsumeHelpText(
  btSymbol: string,
  dtBalance: string,
  dtSymbol: string,
  hasDatatoken: boolean,
  hasPreviousOrder: boolean,
  assetType: string,
  isConsumable: boolean,
  isBalanceSufficient: boolean,
  consumableFeedback: string,
  isSupportedOceanNetwork: boolean,
  isAccountConnected: boolean,
  priceType: string
) {
  const text =
    isConsumable === false
      ? consumableFeedback
      : hasPreviousOrder && isAccountConnected && isSupportedOceanNetwork
      ? ''
      : hasDatatoken
      ? `You own ${dtBalance} ${dtSymbol} allowing you to use this dataset by spending 1 ${dtSymbol}, but without paying ${btSymbol} again.`
      : isBalanceSufficient === false
      ? `You do not have enough ${btSymbol} in your wallet to purchase this asset.`
      : priceType === 'free'
      ? ''
      : `To use this ${assetType}, you will buy 1 ${dtSymbol} and immediately send it back to the publisher.`
  return text
}

function getAlgoHelpText(
  dtSymbolSelectedComputeAsset: string,
  dtBalanceSelectedComputeAsset: string,
  isConsumable: boolean,
  isAlgorithmConsumable: boolean,
  hasPreviousOrderSelectedComputeAsset: boolean,
  selectedComputeAssetType: string,
  hasDatatokenSelectedComputeAsset: boolean,
  isBalanceSufficient: boolean,
  isSupportedOceanNetwork: boolean,
  isAccountConnected: boolean,
  algorithmPriceType: string
) {
  const text =
    (!dtSymbolSelectedComputeAsset && !dtBalanceSelectedComputeAsset) ||
    isConsumable === false ||
    isAlgorithmConsumable === false
      ? ''
      : hasPreviousOrderSelectedComputeAsset &&
        isAccountConnected &&
        isSupportedOceanNetwork
      ? `You already bought the selected ${selectedComputeAssetType}, allowing you to use it without paying again.`
      : hasDatatokenSelectedComputeAsset
      ? `You own ${dtBalanceSelectedComputeAsset} ${dtSymbolSelectedComputeAsset} allowing you to use the selected ${selectedComputeAssetType} by spending 1 ${dtSymbolSelectedComputeAsset}, but without paying OCEAN again.`
      : isAccountConnected && !isSupportedOceanNetwork
      ? `Connect to the correct network to interact with this asset.`
      : isBalanceSufficient === false
      ? ''
      : algorithmPriceType === 'free'
      ? `Additionally, the selected ${selectedComputeAssetType} is free to use.`
      : `Additionally, you will buy 1 ${dtSymbolSelectedComputeAsset} for the ${selectedComputeAssetType} and send it back to the publisher.`
  return text
}

function getComputeAssetHelpText(
  hasPreviousOrder: boolean,
  hasDatatoken: boolean,
  btSymbol: string,
  dtSymbol: string,
  dtBalance: string,
  isConsumable: boolean,
  consumableFeedback: string,
  isBalanceSufficient: boolean,
  algorithmPriceType: string,
  priceType: string,
  hasPreviousOrderSelectedComputeAsset?: boolean,
  hasDatatokenSelectedComputeAsset?: boolean,
  assetType?: string,
  dtSymbolSelectedComputeAsset?: string,
  dtBalanceSelectedComputeAsset?: string,
  selectedComputeAssetType?: string,
  isAlgorithmConsumable?: boolean,
  isSupportedOceanNetwork?: boolean,
  isAccountConnected?: boolean,
  hasProviderFee?: boolean
) {
  const computeAssetHelpText = getConsumeHelpText(
    btSymbol,
    dtBalance,
    dtSymbol,
    hasDatatoken,
    hasPreviousOrder,
    assetType,
    isConsumable,
    isBalanceSufficient,
    consumableFeedback,
    isSupportedOceanNetwork,
    isAccountConnected,
    priceType
  )

  const computeAlgoHelpText = getAlgoHelpText(
    dtSymbolSelectedComputeAsset,
    dtBalanceSelectedComputeAsset,
    isConsumable,
    isAlgorithmConsumable,
    hasPreviousOrderSelectedComputeAsset,
    selectedComputeAssetType,
    hasDatatokenSelectedComputeAsset,
    isBalanceSufficient,
    isSupportedOceanNetwork,
    isAccountConnected,
    algorithmPriceType
  )

  const providerFeeHelpText = hasProviderFee
    ? 'In order to start the job you also need to pay the fees for renting the c2d resources.'
    : 'The C2D resources required to start the job are available, no payment is required for them.'
  let computeHelpText = `${computeAssetHelpText} ${computeAlgoHelpText} ${providerFeeHelpText}`

  computeHelpText = computeHelpText.replace(/^\s+/, '')
  return computeHelpText
}

export default function ButtonBuy({
  action,
  disabled,
  hasPreviousOrder,
  hasDatatoken,
  btSymbol,
  dtSymbol,
  dtBalance,
  assetType,
  assetTimeout,
  isConsumable,
  consumableFeedback,
  isBalanceSufficient,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  dtSymbolSelectedComputeAsset,
  dtBalanceSelectedComputeAsset,
  selectedComputeAssetType,
  onClick,
  stepText,
  isLoading,
  type,
  priceType,
  algorithmPriceType,
  isAlgorithmConsumable,
  hasProviderFee,
  retry,
  isSupportedOceanNetwork,
  isAccountConnected,
  computeWizard
}: ButtonBuyProps): ReactElement {
  console.log('Buy button is pressed ')
  const buttonText = retry
    ? 'Retry'
    : action === 'download'
    ? hasPreviousOrder
      ? 'Download'
      : priceType === 'free'
      ? 'Get'
      : `Buy ${assetTimeout === 'Forever' ? '' : ` for ${assetTimeout}`}`
    : hasPreviousOrder &&
      hasPreviousOrderSelectedComputeAsset &&
      !hasProviderFee
    ? 'Start Compute Job'
    : priceType === 'free' && algorithmPriceType === 'free'
    ? 'Order Compute Job'
    : `Buy Compute Job`

  function message(): string {
    let message = ''
    if (action === 'download') {
      message = getConsumeHelpText(
        btSymbol,
        dtBalance,
        dtSymbol,
        hasDatatoken,
        hasPreviousOrder,
        assetType,
        isConsumable,
        isBalanceSufficient,
        consumableFeedback,
        isSupportedOceanNetwork,
        isAccountConnected,
        priceType
      )
    } else {
      message = getComputeAssetHelpText(
        hasPreviousOrder,
        hasDatatoken,
        btSymbol,
        dtSymbol,
        dtBalance,
        isConsumable,
        consumableFeedback,
        isBalanceSufficient,
        algorithmPriceType,
        priceType,
        hasPreviousOrderSelectedComputeAsset,
        hasDatatokenSelectedComputeAsset,
        assetType,
        dtSymbolSelectedComputeAsset,
        dtBalanceSelectedComputeAsset,
        selectedComputeAssetType,
        isAlgorithmConsumable,
        isSupportedOceanNetwork,
        isAccountConnected,
        hasProviderFee
      )
    }

    return message
  }
  return (
    <div
      className={`${styles.actions} ${
        action === 'download' && priceType === 'free' ? styles.noMargin : ''
      }`}
    >
      {isLoading ? (
        <div className={styles.loaderWrap}>
          <Loader
            message={stepText}
            noMargin={true}
            className={
              action === 'download' &&
              priceType === 'free' &&
              stepText === 'Ordering asset'
                ? styles.orderingAsset
                : ''
            }
          />
        </div>
      ) : (
        <>
          <Button
            style="publish"
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${action === 'compute' ? styles.actionsCenter : ''} ${
              action === 'download' && priceType === 'free'
                ? styles.freeAssetButton
                : ''
            }`}
          >
            {action === 'download' && priceType === 'free' && <Download2SVG />}
            {buttonText}
          </Button>
          {!computeWizard && message() && (
            <div className={styles.help}>{message()}</div>
          )}
        </>
      )}
    </div>
  )
}
