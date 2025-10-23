import { ReactElement, useEffect, useState } from 'react'
import { Field, Form, Formik, useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import { Signer } from 'ethers'
import { toast } from 'react-toastify'
import Decimal from 'decimal.js'

import {
  FileInfo,
  LoggerInstance,
  ZERO_ADDRESS,
  UserCustomParameters
} from '@oceanprotocol/lib'

import { useAsset } from '@context/Asset'
import { useSsiWallet } from '@context/SsiWallet'
import { useIsMounted } from '@hooks/useIsMounted'
import useNetworkMetadata from '@hooks/useNetworkMetadata'

import { order } from '@utils/order'
import { downloadFile } from '@utils/provider'
import { getOrderFeedback } from '@utils/feedback'
import {
  getAvailablePrice,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'
import { secondsToString } from '@utils/ddo'
import { MAX_DECIMALS } from '@utils/constants'
import { checkVerifierSessionId } from '@utils/wallet/policyServer'

import Input from '@shared/FormInput'
import Button from '@shared/atoms/Button'
import Alert from '@shared/atoms/Alert'
import FormErrorGroup from '@shared/FormInput/CheckboxGroupWithErrors'
import SuccessConfetti from '@components/@shared/SuccessConfetti'
import ButtonBuy from '../ButtonBuy'
import CalculateButtonBuy from '../CalculateButtonBuy'
import { AssetActionCheckCredentials } from '../CheckCredentials'
import ConsumerParameters, {
  parseConsumerParameterValues
} from '../ConsumerParameters'
import Loader from '@shared/atoms/Loader'
import AlgorithmDatasetsListForCompute from '../Compute/AlgorithmDatasetsListForCompute'
import { Row } from '../Row'

import { AssetPrice } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'

import appConfig, {
  consumeMarketFixedSwapFee,
  customProviderUrl
} from 'app.config.cjs'
import styles from './index.module.css'

import { getDownloadValidationSchema } from './_validation'
import { getDefaultValues } from '../ConsumerParameters/FormConsumerParameters'

export default function Download({
  accountId,
  signer,
  asset,
  service,
  accessDetails,
  serviceIndex,
  isBalanceSufficient,
  dtBalance,
  isAccountIdWhitelisted,
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
  const { isInPurgatory, isAssetNetwork } = useAsset()
  const isMounted = useIsMounted()

  const [isDisabled, setIsDisabled] = useState(true)
  const [hasDatatoken, setHasDatatoken] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setIsPriceLoading] = useState(false)
  const [isFullPriceLoading, setIsFullPriceLoading] = useState(
    accessDetails.type !== 'free'
  )
  const [isOwned, setIsOwned] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [validOrderTx, setValidOrderTx] = useState('')
  const [justBought, setJustBought] = useState(false)

  const [orderPriceAndFees, setOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [retry, setRetry] = useState<boolean>(false)
  const [credentialCheckComplete, setCredentialCheckComplete] =
    useState<boolean>(false)

  const {
    verifierSessionCache,
    lookupVerifierSessionId,
    lookupVerifierSessionIdSkip
  } = useSsiWallet()

  useEffect(() => {
    const hasValidSession =
      verifierSessionCache &&
      (lookupVerifierSessionId(asset.id, service.id) ||
        lookupVerifierSessionIdSkip(asset.id, service.id))
    if (hasValidSession && !credentialCheckComplete) {
      setCredentialCheckComplete(true)
    }
  }, [
    verifierSessionCache,
    asset.id,
    service.id,
    credentialCheckComplete,
    lookupVerifierSessionId,
    lookupVerifierSessionIdSkip
  ])

  const price: AssetPrice = getAvailablePrice(accessDetails)
  const isUnsupportedPricing =
    accessDetails.type === 'NOT_SUPPORTED' ||
    (accessDetails.type === 'fixed' && !accessDetails.baseToken?.symbol)

  useEffect(() => {
    if (asset?.indexedMetadata?.event?.from === accountId) {
      setIsOwner(true)
    }
  }, [asset, accountId])

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
          // Prefer validated session; if only skip-session exists, use it
          lookupVerifierSessionId(asset.id, service.id) ||
            lookupVerifierSessionIdSkip(asset.id, service.id),
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
        setJustBought(true)
      }
    } catch (error) {
      LoggerInstance.error(error)
      setRetry(true)
      if (
        error?.message?.includes('user rejected transaction') ||
        error?.message?.includes('User denied') ||
        error?.message?.includes('MetaMask Tx Signature: User denied')
      ) {
        toast.info('Transaction was cancelled by user')
        return
      }

      const message = isOwned
        ? 'Failed to download file!'
        : 'An error occurred, please retry. Check console for more information.'
      toast.error(message)
    }
    setIsLoading(false)
  }

  async function handleFormSubmit(values: any) {
    try {
      const skip = lookupVerifierSessionIdSkip(asset.id, service.id)
      if (appConfig.ssiEnabled && !skip) {
        const result = await checkVerifierSessionId(
          lookupVerifierSessionId(asset.id, service.id)
        )
        if (!result.success) {
          toast.error('Invalid session')
          return
        }
      }

      const dataServiceParams = parseConsumerParameterValues(
        values?.dataServiceParams,
        service.consumerParameters
      )

      await handleOrderOrDownload(dataServiceParams)
    } catch (error) {
      toast.error(error.message)
      LoggerInstance.error(error)
    }
  }

  const handleFullPrice = () => {
    setIsFullPriceLoading(false)
  }

  const CalculateButton = () => (
    <CalculateButtonBuy
      type="submit"
      onClick={handleFullPrice}
      stepText={statusText}
      isLoading={isLoading}
    />
  )

  const PurchaseButton = ({ isValid }: { isValid?: boolean }) => {
    return (
      <ButtonBuy
        action="download"
        disabled={isDisabled || !isValid}
        hasPreviousOrder={isOwned}
        hasDatatoken={hasDatatoken}
        btSymbol={accessDetails.baseToken?.symbol}
        dtSymbol={asset.indexedMetadata?.stats[serviceIndex]?.symbol} // TODO - check datatokens
        dtBalance={dtBalance}
        type="submit"
        assetTimeout={secondsToString(service.timeout)}
        assetType={asset.credentialSubject?.metadata?.type}
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
  }

  const AssetAction = ({ asset }: { asset: AssetExtended }) => {
    return (
      <div className={styles.info}>
        {isUnsupportedPricing ? (
          <Alert
            state="info"
            text={`No pricing schema available for this asset.`}
          />
        ) : null}
      </div>
    )
  }

  const AssetActionBuy = () => {
    const { isValid } = useFormikContext()

    return (
      <div style={{ textAlign: 'left', marginTop: '2%' }}>
        {!isPriceLoading &&
          !isOwned &&
          new Decimal(price.value || 0).greaterThan(0) && (
            <div className={styles.calculation}>
              <Row
                hasDatatoken={hasDatatoken}
                price={new Decimal(
                  Number(orderPriceAndFees?.price) || price.value || 0
                )
                  .toDecimalPlaces(MAX_DECIMALS)
                  .toString()}
                symbol={price.tokenSymbol}
                type="DATASET"
              />
              <Row
                price={new Decimal(consumeMarketFixedSwapFee)
                  .mul(
                    new Decimal(
                      Number(orderPriceAndFees?.price) || price.value || 0
                    )
                      .toDecimalPlaces(MAX_DECIMALS)
                      .div(100)
                  )
                  .toString()} // consume market fixed swap fee amount
                symbol={price.tokenSymbol}
                type={`CONSUME MARKET ORDER FEE (${consumeMarketFixedSwapFee}%)`}
              />
              <Row
                price={orderPriceAndFees?.opcFee || '0'}
                symbol={price.tokenSymbol}
                type={`OPC FEE (${(
                  (parseFloat(orderPriceAndFees.opcFee) /
                    parseFloat(orderPriceAndFees.price)) *
                  100
                ).toFixed(1)}%)`}
              />
              <Row
                price={new Decimal(
                  new Decimal(
                    Number(orderPriceAndFees?.price) || price.value || 0
                  ).toDecimalPlaces(MAX_DECIMALS)
                )
                  .add(
                    new Decimal(consumeMarketFixedSwapFee).mul(
                      new Decimal(
                        Number(orderPriceAndFees?.price) || price.value || 0
                      )
                        .toDecimalPlaces(MAX_DECIMALS)
                        .div(100)
                    )
                  )
                  .add(new Decimal(orderPriceAndFees?.opcFee || 0))
                  .toString()}
                symbol={price.tokenSymbol}
              />
            </div>
          )}

        <FormErrorGroup
          errorFields={['termsAndConditions', 'acceptPublishingLicense']}
        >
          <Field
            component={Input}
            name="termsAndConditions"
            type="checkbox"
            options={['Terms and Conditions']}
            prefixes={['I agree to the']}
            actions={['/terms']}
            disabled={isLoading}
            hideLabel={true}
          />
          <Field
            component={Input}
            name="acceptPublishingLicense"
            type="checkbox"
            options={['Publishing License']}
            prefixes={['I agree the']}
            disabled={isLoading}
            hideLabel={true}
          />
        </FormErrorGroup>

        <div className={styles.buttonContainer}>
          {!isInPurgatory && <PurchaseButton isValid={isValid} />}
        </div>
      </div>
    )
  }

  return (
    <Formik
      initialValues={{
        dataServiceParams: getDefaultValues(service.consumerParameters)
      }}
      validateOnMount
      validationSchema={getDownloadValidationSchema(service.consumerParameters)}
      onSubmit={(values) => {
        if (
          !(
            lookupVerifierSessionId(asset.id, service.id) ||
            lookupVerifierSessionIdSkip(asset.id, service.id)
          ) &&
          appConfig.ssiEnabled
        ) {
          return
        }
        handleFormSubmit(values)
      }}
    >
      <Form>
        {(() => {
          function getLocalSessionImmediate(
            did: string,
            svcId: string
          ): string {
            try {
              if (typeof window === 'undefined') return ''
              const storage = localStorage.getItem('verifierSessionId')
              const sessions = storage ? JSON.parse(storage) : {}
              return (
                sessions?.[`${did}_${svcId}`] ||
                sessions?.[`${did}_${svcId}_skip`] ||
                ''
              )
            } catch {
              return ''
            }
          }
          const sessionId =
            lookupVerifierSessionId(asset.id, service.id) ||
            lookupVerifierSessionIdSkip(asset.id, service.id)
          const localSession = getLocalSessionImmediate(asset.id, service.id)
          const hasSession = Boolean(
            sessionId || localSession || credentialCheckComplete
          )
          const canRenderConsume = !appConfig.ssiEnabled || hasSession

          if (!canRenderConsume) {
            return (
              <aside className={styles.consume}>
                <AssetActionCheckCredentials asset={asset} service={service} />
                {credentialCheckComplete && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <Button
                      type="button"
                      style="primary"
                      size="small"
                      onClick={() => window.location.reload()}
                    >
                      Refresh to Show Download Button
                    </Button>
                  </div>
                )}
              </aside>
            )
          }

          return (
            <aside
              className={`${styles.consume} ${
                appConfig.ssiEnabled && hasSession ? styles.tighterStack : ''
              }`}
            >
              {isUnsupportedPricing && (
                <div className={styles.info}>
                  <AssetAction asset={asset} />
                </div>
              )}
              {!isOwner &&
                (isFullPriceLoading ? (
                  <>
                    <div className={styles.noMarginAlert}>
                      <Alert
                        state="success"
                        text="SSI credential verification passed"
                      />
                    </div>
                    <CalculateButton />
                  </>
                ) : (
                  <>
                    {isPriceLoading && (
                      <div className={styles.noMarginAlert}>
                        <Loader
                          message="Calculating price..."
                          variant="primary"
                        />
                      </div>
                    )}
                    {accessDetails.type === 'free' && (
                      <div className={styles.noMarginAlert}>
                        <Alert
                          state="info"
                          text="This dataset is free to use. Please note that network gas fees still apply, even when using free assets."
                        />
                      </div>
                    )}
                    {justBought && (
                      <div>
                        <SuccessConfetti
                          success={`You successfully bought this ${asset.credentialSubject?.metadata?.type} and are now able to download it.`}
                        />
                      </div>
                    )}
                    <AssetActionBuy />
                  </>
                ))}
              {Array.isArray(service.consumerParameters) &&
                service.consumerParameters.length > 0 && (
                  <div className={styles.consumerParameters}>
                    <ConsumerParameters
                      services={[service]}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              {/* {justBought && (
                <div className={styles.confettiContainer}>
                  <SuccessConfetti
                    success={`You successfully bought this ${asset.credentialSubject?.metadata?.type} and are now able to download it.`}
                  />
                </div>
              )} */}
              {asset.credentialSubject?.metadata?.type === 'algorithm' && (
                <AlgorithmDatasetsListForCompute
                  asset={asset}
                  service={service}
                  accessDetails={accessDetails}
                />
              )}
            </aside>
          )
        })()}
      </Form>
    </Formik>
  )
}
