import { ReactElement, useEffect, useState } from 'react'
import FileIcon from '@shared/FileIcon'
import Price from '@shared/Price'
import { useAsset } from '@context/Asset'
import ButtonBuy from '../ButtonBuy'
import { secondsToString } from '@utils/ddo'
import styles from './index.module.css'
import AlgorithmDatasetsListForCompute from '../Compute/AlgorithmDatasetsListForCompute'
import {
  AssetPrice,
  FileInfo,
  LoggerInstance,
  Service,
  UserCustomParameters,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import { order } from '@utils/order'
import { downloadFile } from '@utils/provider'
import { getOrderFeedback } from '@utils/feedback'
import {
  getAvailablePrice,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'
import { toast } from 'react-toastify'
import { useIsMounted } from '@hooks/useIsMounted'
import { useMarketMetadata } from '@context/MarketMetadata'
import Alert from '@shared/atoms/Alert'
import Loader from '@shared/atoms/Loader'
import { useAccount } from 'wagmi'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import ConsumerParameters, {
  parseConsumerParameterValues
} from '../ConsumerParameters'
import { Field, Form, Formik, useFormikContext } from 'formik'
import { getDownloadValidationSchema } from './_validation'
import { getDefaultValues } from '../ConsumerParameters/FormConsumerParameters'
import WhitelistIndicator from '../Compute/WhitelistIndicator'
import { Signer } from 'ethers'
import SuccessConfetti from '@components/@shared/SuccessConfetti'
import Input from '@components/@shared/FormInput'

export default function Download({
  accountId,
  signer,
  asset,
  service,
  accessDetails,
  serviceIndex,
  file,
  isBalanceSufficient,
  dtBalance,
  isAccountIdWhitelisted,
  fileIsLoading,
  consumableFeedback
}: {
  accountId: string
  signer: Signer
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  serviceIndex: number
  file: FileInfo
  isBalanceSufficient: boolean
  dtBalance: string
  isAccountIdWhitelisted: boolean
  fileIsLoading?: boolean
  consumableFeedback?: string
}): ReactElement {
  const { isConnected } = useAccount()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const { getOpcFeeForToken } = useMarketMetadata()
  const { isInPurgatory, isAssetNetwork } = useAsset()
  const isMounted = useIsMounted()

  const [isDisabled, setIsDisabled] = useState(true)
  const [hasDatatoken, setHasDatatoken] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [isOwned, setIsOwned] = useState(false)
  const [validOrderTx, setValidOrderTx] = useState('')
  const [isOrderDisabled, setIsOrderDisabled] = useState(false)
  const [orderPriceAndFees, setOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [retry, setRetry] = useState<boolean>(false)

  const price: AssetPrice = getAvailablePrice(accessDetails)
  const isUnsupportedPricing =
    accessDetails.type === 'NOT_SUPPORTED' ||
    (accessDetails.type === 'fixed' && !accessDetails.baseToken?.symbol)

  useEffect(() => {
    Number(asset.nft.state) === 4 && setIsOrderDisabled(true)
  }, [asset.nft.state])

  useEffect(() => {
    if (isUnsupportedPricing) return

    setIsOwned(accessDetails.isOwned || false)
    setValidOrderTx(accessDetails.validOrderTx || '')

    // get full price and fees
    async function init() {
      if (
        accessDetails.addressOrId === ZERO_ADDRESS ||
        accessDetails.type === 'free'
      )
        return

      try {
        !orderPriceAndFees && setIsPriceLoading(true)

        const _orderPriceAndFees = await getOrderPriceAndFees(
          asset,
          service,
          accessDetails,
          accountId || ZERO_ADDRESS
        )
        setOrderPriceAndFees(_orderPriceAndFees)
        !orderPriceAndFees && setIsPriceLoading(false)
      } catch (error) {
        LoggerInstance.error('getOrderPriceAndFees', error)
        setIsPriceLoading(false)
      }
    }

    if (!orderPriceAndFees) init()

    /**
     * we listen to the assets' changes to get the most updated price
     * based on the asset and the poolData's information.
     * Not adding isLoading and getOpcFeeForToken because we set these here. It is a compromise
     */
  }, [
    accessDetails,
    accountId,
    asset,
    isUnsupportedPricing,
    orderPriceAndFees,
    service
  ])

  useEffect(() => {
    setHasDatatoken(Number(dtBalance) >= 1)
  }, [dtBalance])

  useEffect(() => {
    if (
      (accessDetails.type === 'fixed' && !orderPriceAndFees) ||
      !isMounted ||
      !accountId ||
      isUnsupportedPricing
    )
      return

    /**
     * disabled in these cases:
     * - if the asset is not purchasable
     * - if the user is on the wrong network
     * - if user balance is not sufficient
     * - if user has no datatokens
     * - if user is not whitelisted or blacklisted
     */
    const isDisabled =
      !accessDetails.isPurchasable ||
      !isAssetNetwork ||
      ((!isBalanceSufficient || !isAssetNetwork) &&
        !isOwned &&
        !hasDatatoken) ||
      !isAccountIdWhitelisted
    setIsDisabled(isDisabled)
  }, [
    isMounted,
    isBalanceSufficient,
    isAssetNetwork,
    hasDatatoken,
    accountId,
    isOwned,
    isUnsupportedPricing,
    orderPriceAndFees,
    isAccountIdWhitelisted,
    accessDetails
  ])

  async function handleOrderOrDownload(dataParams?: UserCustomParameters) {
    setIsLoading(true)
    setRetry(false)
    try {
      if (isOwned) {
        setStatusText(
          getOrderFeedback(
            accessDetails.baseToken?.symbol,
            accessDetails.datatoken?.symbol
          )[3]
        )

        await downloadFile(
          signer,
          asset,
          service,
          accessDetails,
          accountId,
          validOrderTx,
          dataParams
        )
      } else {
        setStatusText(
          getOrderFeedback(
            accessDetails.baseToken?.symbol,
            accessDetails.datatoken?.symbol
          )[accessDetails.type === 'fixed' ? 2 : 1]
        )
        const orderTx = await order(
          signer,
          asset,
          service,
          accessDetails,
          orderPriceAndFees,
          accountId,
          hasDatatoken
        )
        const tx = await orderTx.wait()
        if (!tx) {
          throw new Error()
        }
        setIsOwned(true)
        setValidOrderTx(tx.transactionHash)
      }
    } catch (error) {
      LoggerInstance.error(error)
      setRetry(true)
      const message = isOwned
        ? 'Failed to download file!'
        : 'An error occurred, please retry. Check console for more information.'
      toast.error(message)
    }
    setIsLoading(false)
  }

  const PurchaseButton = ({ isValid }: { isValid?: boolean }) => (
    <ButtonBuy
      action="download"
      disabled={isDisabled || !isValid}
      hasPreviousOrder={isOwned}
      hasDatatoken={hasDatatoken}
      btSymbol={accessDetails.baseToken?.symbol}
      dtSymbol={asset.datatokens[serviceIndex]?.symbol} // TODO - check datatokens
      dtBalance={dtBalance}
      type="submit"
      assetTimeout={secondsToString(service.timeout)}
      assetType={asset.metadata?.type}
      stepText={statusText}
      isLoading={isLoading}
      priceType={accessDetails.type}
      isConsumable={accessDetails.isPurchasable}
      isBalanceSufficient={isBalanceSufficient}
      consumableFeedback={consumableFeedback}
      retry={retry}
      isSupportedOceanNetwork={isSupportedOceanNetwork}
      isAccountConnected={isConnected}
    />
  )

  const AssetAction = ({ asset }: { asset: AssetExtended }) => {
    const { isValid } = useFormikContext()

    return (
      <div>
        {isOrderDisabled ? (
          <Alert
            className={styles.fieldWarning}
            state="info"
            text={`The publisher temporarily disabled ordering for this asset`}
          />
        ) : (
          <>
            {isUnsupportedPricing ? (
              <Alert
                className={styles.fieldWarning}
                state="info"
                text={`No pricing schema available for this asset.`}
              />
            ) : (
              <div className={styles.priceWrapper}>
                {isPriceLoading ? (
                  <Loader message="Calculating full price (including fees)" />
                ) : (
                  <Price
                    price={price}
                    orderPriceAndFees={orderPriceAndFees}
                    size="large"
                  />
                )}
                {!isInPurgatory && <PurchaseButton isValid={isValid} />}
                <Field
                  component={Input}
                  name="termsAndConditions"
                  type="checkbox"
                  options={['Terms and Conditions']}
                  prefixes={['I agree to the']}
                  actions={['/terms']}
                  disabled={isLoading}
                />
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <Formik
      initialValues={{
        dataServiceParams: getDefaultValues(service.consumerParameters),
        termsAndConditions: false
      }}
      validateOnMount
      validationSchema={getDownloadValidationSchema(service.consumerParameters)}
      onSubmit={async (values) => {
        const dataServiceParams = parseConsumerParameterValues(
          values?.dataServiceParams,
          service.consumerParameters
        )

        await handleOrderOrDownload(dataServiceParams)
      }}
    >
      <Form>
        <aside className={styles.consume}>
          <div className={styles.info}>
            <div className={styles.filewrapper}>
              <FileIcon
                file={file}
                isAccountWhitelisted={isAccountIdWhitelisted}
                isLoading={fileIsLoading}
                small
              />
            </div>
            <AssetAction asset={asset} />
          </div>
          <div className={styles.consumerParameters}>
            {/* TODO - */}
            <ConsumerParameters service={service} isLoading={isLoading} />
          </div>
          {isOwned && (
            <div className={styles.confettiContainer}>
              <SuccessConfetti
                success={`You successfully bought this ${asset.metadata.type} and are now able to download it.`}
              />
            </div>
          )}
          {asset.metadata?.type === 'algorithm' && (
            <AlgorithmDatasetsListForCompute
              asset={asset}
              service={service}
              accessDetails={accessDetails}
            />
          )}
          {accountId && (
            <WhitelistIndicator
              accountId={accountId}
              isAccountIdWhitelisted={isAccountIdWhitelisted}
            />
          )}
        </aside>
      </Form>
    </Formik>
  )
}
