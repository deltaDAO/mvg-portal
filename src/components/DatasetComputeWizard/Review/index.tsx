import { ReactElement, useEffect, useState } from 'react'
import { useFormikContext, Field, FormikContextType } from 'formik'
import Input from '@shared/FormInput'
import StepTitle from '@shared/StepTitle'
import { FormComputeData } from '../_types'
import PricingRow from './PricingRow'
import FormErrorGroup from '@shared/FormInput/CheckboxGroupWithErrors'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { AssetActionCheckCredentials } from '../../Asset/AssetActions/CheckCredentials'
import { AssetActionCheckCredentialsAlgo } from '../../Asset/AssetActions/CheckCredentials/checkCredentialsAlgo'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { ResourceType } from 'src/@types/ResourceType'
import styles from './index.module.css'
import { useAccount } from 'wagmi'
import useBalance from '@hooks/useBalance'
import { useSsiWallet } from '@context/SsiWallet'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import { consumeMarketOrderFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { Asset } from 'src/@types/Asset'
import { useAsset } from '@context/Asset'
import ButtonBuy from '@components/Asset/AssetActions/ButtonBuy'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import Loader from '@components/@shared/atoms/Loader'

interface VerificationItem {
  id: string
  type: 'dataset' | 'algorithm'
  asset: AssetExtended
  service: Service
  isVerified: boolean
  hasError: boolean
  index: number
  price: string
  duration: string
  name: string
}

export default function Review({
  isRequestingPrice = false,
  asset,
  service,
  accessDetails,
  algorithms,
  ddoListAlgorithms,
  selectedAlgorithmAsset,
  setSelectedAlgorithmAsset,
  isLoading,
  isComputeButtonDisabled,
  hasPreviousOrder,
  hasDatatoken,
  dtBalance,
  assetTimeout,
  hasPreviousOrderSelectedComputeAsset,
  hasDatatokenSelectedComputeAsset,
  isAccountIdWhitelisted,
  datasetSymbol,
  algorithmSymbol,
  providerFeesSymbol,
  dtSymbolSelectedComputeAsset,
  dtBalanceSelectedComputeAsset,
  selectedComputeAssetType,
  selectedComputeAssetTimeout,
  computeEnvs,
  stepText,
  isConsumable,
  consumableFeedback,
  datasetOrderPriceAndFees,
  algoOrderPriceAndFees,
  providerFeeAmount,
  validUntil,
  retry,
  onRunInitPriceAndFees,
  onCheckAlgoDTBalance,
  allResourceValues,
  setAllResourceValues,
  jobs,
  isLoadingJobs,
  refetchJobs
}: {
  asset?: AssetExtended
  service?: Service
  accessDetails?: AccessDetails
  algorithms?: AssetSelectionAsset[]
  ddoListAlgorithms?: Asset[]
  selectedAlgorithmAsset?: AssetExtended
  setSelectedAlgorithmAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended>
  >
  isLoading?: boolean
  isComputeButtonDisabled?: boolean
  hasPreviousOrder?: boolean
  hasDatatoken?: boolean
  dtBalance?: string
  assetTimeout?: string
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  isAccountIdWhitelisted?: boolean
  datasetSymbol?: string
  algorithmSymbol?: string
  providerFeesSymbol?: string
  dtSymbolSelectedComputeAsset?: string
  dtBalanceSelectedComputeAsset?: string
  selectedComputeAssetType?: string
  selectedComputeAssetTimeout?: string
  computeEnvs?: ComputeEnvironment[]
  stepText?: string
  isConsumable?: boolean
  consumableFeedback?: string
  datasetOrderPriceAndFees?: OrderPriceAndFees
  algoOrderPriceAndFees?: OrderPriceAndFees
  providerFeeAmount?: string
  validUntil?: string
  retry?: boolean
  onRunInitPriceAndFees?: () => Promise<void>
  onCheckAlgoDTBalance?: () => Promise<void>
  allResourceValues?: {
    [envId: string]: ResourceType
  }
  setAllResourceValues?: React.Dispatch<
    React.SetStateAction<{
      [envId: string]: ResourceType
    }>
  >
  jobs?: any[]
  isLoadingJobs?: boolean
  refetchJobs?: () => void
  isRequestingPrice?: boolean
}): ReactElement {
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const { isValid, setFieldValue, values }: FormikContextType<FormComputeData> =
    useFormikContext()
  const { isAssetNetwork } = useAsset()

  // State for verification flow
  const [verificationQueue, setVerificationQueue] = useState<
    VerificationItem[]
  >([])
  const [currentVerificationIndex, setCurrentVerificationIndex] =
    useState<number>(-1)
  const [showCredentialsCheck, setShowCredentialsCheck] =
    useState<boolean>(false)
  const [datasetOrderPrice, setDatasetOrderPrice] = useState<string | null>(
    accessDetails.price
  )
  const [algoOrderPrice, setAlgoOrderPrice] = useState(
    selectedAlgorithmAsset?.accessDetails?.[0]?.price
  )
  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedEnvId = values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]
  const c2dPrice =
    values?.mode === 'paid' ? paidResources?.price : freeResources?.price
  const [allDatasetServices, setAllDatasetServices] = useState<Service[]>([])
  const [datasetVerificationIndex, setDatasetVerificationIndex] = useState(0)
  const [activeCredentialAsset, setActiveCredentialAsset] =
    useState<AssetExtended | null>(null)
  const formatDuration = (seconds: number): string => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    const parts: string[] = []
    if (d) parts.push(`${d}d`)
    if (h) parts.push(`${h}h`)
    if (m) parts.push(`${m}m`)
    if (s) parts.push(`${s}s`)
    return parts.join(' ') || '0s'
  }
  // Build verification queue from dataset and algorithm
  useEffect(() => {
    const queue: VerificationItem[] = []

    // Add dataset to queue if exists
    if (asset && service) {
      const isVerified = lookupVerifierSessionId?.(asset.id, service.id)
      const rawPrice = asset.accessDetails?.[0].validOrderTx
        ? '0'
        : asset.accessDetails?.[0].price

      const existingItem = verificationQueue.find(
        (item) => item.id === asset.id && item.type === 'dataset'
      )

      let preservedIsVerified = Boolean(isVerified)
      let preservedHasError = false

      if (existingItem) {
        const currentSessionValid = Boolean(isVerified)

        if (existingItem.isVerified && !currentSessionValid) {
          preservedIsVerified = false
          preservedHasError = false
        } else if (currentSessionValid) {
          preservedIsVerified = existingItem.isVerified
          preservedHasError = existingItem.hasError
        } else {
          preservedIsVerified = false
          preservedHasError = existingItem.hasError
        }
      }

      queue.push({
        id: asset.id,
        type: 'dataset',
        asset,
        service,
        isVerified: preservedIsVerified,
        hasError: preservedHasError,
        index: 0,
        price: rawPrice,
        duration: formatDuration(service.timeout || 0),
        name: service.name
      })
    }

    // Add algorithm to queue if exists
    if (selectedAlgorithmAsset) {
      const algoService =
        selectedAlgorithmAsset.credentialSubject?.services?.[serviceIndex]
      const isVerified = lookupVerifierSessionId?.(
        selectedAlgorithmAsset.id,
        algoService?.id
      )

      const details = selectedAlgorithmAsset.accessDetails?.[serviceIndex]
      const rawPrice = details?.validOrderTx ? '0' : details?.price || '0'

      const existingItem = verificationQueue.find(
        (item) =>
          item.id === selectedAlgorithmAsset.id && item.type === 'algorithm'
      )

      let preservedIsVerified = Boolean(isVerified)
      let preservedHasError = false

      if (existingItem) {
        const currentSessionValid = Boolean(isVerified)
        if (existingItem.isVerified && !currentSessionValid) {
          preservedIsVerified = false
          preservedHasError = false
        } else if (currentSessionValid) {
          preservedIsVerified = existingItem.isVerified
          preservedHasError = existingItem.hasError
        } else {
          preservedIsVerified = false
          preservedHasError = existingItem.hasError
        }
      }

      queue.push({
        id: selectedAlgorithmAsset.id,
        type: 'algorithm',
        asset: selectedAlgorithmAsset,
        service: algoService,
        isVerified: preservedIsVerified,
        hasError: preservedHasError,
        index: queue.length,
        price: rawPrice,
        duration: '1 day',
        name:
          selectedAlgorithmAsset.credentialSubject?.services?.[0]?.name ||
          'Algorithm'
      })
    }

    setVerificationQueue(queue)
  }, [
    asset,
    service,
    selectedAlgorithmAsset,
    serviceIndex,
    lookupVerifierSessionId
  ])

  // Start verification for a specific item
  const startVerification = (index: number) => {
    setCurrentVerificationIndex(index)
    setShowCredentialsCheck(true)
  }

  // Handle verification completion
  const handleVerificationComplete = () => {
    // Update verification status
    setVerificationQueue((prev) =>
      prev.map((item, i) =>
        i === currentVerificationIndex
          ? { ...item, isVerified: true, hasError: false }
          : item
      )
    )

    setShowCredentialsCheck(false)

    // Find next unverified item
    const nextIndex = verificationQueue.findIndex(
      (item, index) =>
        index > currentVerificationIndex && !item.isVerified && !item.hasError
    )

    if (nextIndex !== -1) {
      setTimeout(() => startVerification(nextIndex), 300)
    }
  }

  const handleVerificationError = () => {
    setVerificationQueue((prev) => {
      const updated = prev.map((item, i) =>
        i === currentVerificationIndex ? { ...item, hasError: true } : item
      )
      return updated
    })

    setShowCredentialsCheck(false)

    const nextIndex = verificationQueue.findIndex(
      (item, index) =>
        index > currentVerificationIndex && !item.isVerified && !item.hasError
    )

    if (nextIndex !== -1) {
      setTimeout(() => startVerification(nextIndex), 300)
    }
  }

  // Get current item being verified
  const currentVerificationItem = verificationQueue[currentVerificationIndex]

  const computeItems = [
    {
      name: 'C2D RESOURCES',
      value: c2dPrice || '0',
      duration: formatDuration(values.jobDuration)
    }
  ]

  const marketFees = [
    { name: 'CONSUME MARKET ORDER FEE DATASET (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE ALGORITHM (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE C2C (0%)', value: '0' }
  ]

  function getAlgorithmAsset(algo: string): {
    algorithmAsset: AssetExtended | null
    serviceIndexAlgo: number | null
  } {
    let algorithmId: string
    let serviceId: string = ''
    try {
      const parsed = JSON.parse(algo)
      algorithmId = parsed?.algoDid || algo
      serviceId = parsed?.serviceId || ''
    } catch (e) {
      algorithmId = algo
    }

    let assetDdo: AssetExtended | null = null
    let serviceIndexAlgo: number | null = null

    ddoListAlgorithms.forEach((ddo: Asset) => {
      if (ddo.id === algorithmId) {
        assetDdo = ddo
        if (serviceId && ddo.credentialSubject?.services) {
          const index = ddo.credentialSubject.services.findIndex(
            (svc: Service) => svc.id === serviceId
          )
          serviceIndexAlgo = index !== -1 ? index : null
        }
      }
    })

    return { algorithmAsset: assetDdo, serviceIndexAlgo }
  }

  // Pre-select computeEnv and/or algo if there is only one available option
  useEffect(() => {
    if (computeEnvs?.length === 1 && !values.computeEnv) {
      setFieldValue('computeEnv', computeEnvs[0], true)
    }
    if (
      algorithms?.length === 1 &&
      !values.algorithm &&
      algorithms?.[0]?.isAccountIdWhitelisted
    ) {
      const { did } = algorithms[0]
      setFieldValue('algorithm', did, true)
    }
  }, [
    algorithms,
    computeEnvs,
    setFieldValue,
    values.algorithm,
    values.computeEnv
  ])

  useEffect(() => {
    if (!values.algorithm || !isConsumable) return

    async function fetchAlgorithmAssetExtended() {
      const { algorithmAsset, serviceIndexAlgo } = getAlgorithmAsset(
        values.algorithm
      )
      if (serviceIndexAlgo) {
        setServiceIndex(serviceIndexAlgo)
      }
      const algoAccessDetails = await Promise.all(
        algorithmAsset.credentialSubject?.services.map((service) =>
          getAccessDetails(
            algorithmAsset.credentialSubject?.chainId,
            service,
            accountId,
            newCancelToken()
          )
        )
      )

      const extendedAlgoAsset: AssetExtended = {
        ...algorithmAsset,
        accessDetails: algoAccessDetails,
        serviceIndex: serviceIndexAlgo
      }
      setSelectedAlgorithmAsset(extendedAlgoAsset)
    }
    fetchAlgorithmAssetExtended()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.algorithm, accountId, isConsumable, setSelectedAlgorithmAsset])

  useEffect(() => {
    if (!values.computeEnv || !computeEnvs) return

    const currentEnvId =
      typeof values.computeEnv === 'string'
        ? (values.computeEnv as unknown as string)
        : values.computeEnv?.id

    const selectedEnv = computeEnvs.find((env) => env.id === currentEnvId)
    if (!selectedEnv) return

    // if not already initialized, set default resource values
    if (!allResourceValues[selectedEnv.id]) {
      const cpu = selectedEnv.resources.find((r) => r.id === 'cpu')?.min || 1
      const ram =
        selectedEnv.resources.find((r) => r.id === ('ram' as any))?.min ||
        1_000_000_000
      const disk =
        selectedEnv.resources.find((r) => r.id === ('disk' as any))?.min ||
        1_000_000_000
      const jobDuration = selectedEnv.maxJobDuration || 3600

      const newRes = {
        cpu,
        ram,
        disk,
        jobDuration,
        price: 0,
        mode: 'paid'
      }

      setAllResourceValues((prev) => ({
        ...prev,
        [selectedEnv.id]: newRes
      }))
    }
  }, [values.computeEnv, computeEnvs])

  //
  // Set price for calculation output
  //
  useEffect(() => {
    if (!asset?.accessDetails || !selectedAlgorithmAsset?.accessDetails?.length)
      return

    setDatasetOrderPrice(datasetOrderPriceAndFees?.price || accessDetails.price)
    const details = selectedAlgorithmAsset.accessDetails[serviceIndex]
    if (details?.validOrderTx) {
      setAlgoOrderPrice('0')
    } else {
      setAlgoOrderPrice(algoOrderPriceAndFees?.price)
    }

    const totalPrices: totalPriceMap[] = []

    // Always use resources price for C2D (provider) part
    const priceDataset =
      !datasetOrderPrice || hasPreviousOrder || hasDatatoken
        ? new Decimal(0)
        : new Decimal(datasetOrderPrice).toDecimalPlaces(MAX_DECIMALS)
    const rawPrice = details?.validOrderTx ? 0 : details?.price

    // wrap in Decimal and round to your MAX_DECIMALS
    const priceAlgo = new Decimal(rawPrice).toDecimalPlaces(MAX_DECIMALS)

    const priceC2D =
      c2dPrice !== undefined
        ? new Decimal(c2dPrice).toDecimalPlaces(MAX_DECIMALS)
        : new Decimal(0)

    // Now use priceC2D everywhere you'd use providerFees
    const feeAlgo = new Decimal(consumeMarketOrderFee).mul(priceAlgo).div(100)
    const feeC2D = new Decimal(consumeMarketOrderFee).mul(priceC2D).div(100)
    const feeDataset = new Decimal(consumeMarketOrderFee)
      .mul(priceDataset)
      .div(100)

    // This part determines how you aggregate, but **always use priceC2D instead of providerFeeAmount/providerFees**
    if (algorithmSymbol === providerFeesSymbol) {
      let sum = priceC2D.add(priceAlgo).add(feeC2D).add(feeAlgo)
      totalPrices.push({
        value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
        symbol: algorithmSymbol
      })
      if (algorithmSymbol === datasetSymbol) {
        sum = sum.add(priceDataset).add(feeDataset)
        totalPrices[0].value = sum.toDecimalPlaces(MAX_DECIMALS).toString()
      } else {
        totalPrices.push({
          value: priceDataset
            .add(feeDataset)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: datasetSymbol
        })
      }
    } else {
      if (datasetSymbol === providerFeesSymbol) {
        const sum = priceC2D.add(priceDataset).add(feeC2D).add(feeDataset)
        totalPrices.push({
          value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: datasetSymbol
        })
        totalPrices.push({
          value: priceAlgo
            .add(feeAlgo)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: algorithmSymbol
        })
      } else if (datasetSymbol === algorithmSymbol) {
        const sum = priceAlgo.add(priceDataset).add(feeAlgo).add(feeDataset)
        totalPrices.push({
          value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: algorithmSymbol
        })
        totalPrices.push({
          value: priceC2D.add(feeC2D).toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: providerFeesSymbol
        })
      } else {
        totalPrices.push({
          value: priceDataset
            .add(feeDataset)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: datasetSymbol
        })
        totalPrices.push({
          value: priceC2D.add(feeC2D).toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: providerFeesSymbol
        })
        totalPrices.push({
          value: priceAlgo
            .add(feeAlgo)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: algorithmSymbol
        })
      }
    }

    setTotalPrices(totalPrices)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    asset,
    hasPreviousOrder,
    hasDatatoken,
    hasPreviousOrderSelectedComputeAsset,
    hasDatatokenSelectedComputeAsset,
    datasetOrderPriceAndFees,
    algoOrderPriceAndFees,
    isAssetNetwork,
    selectedAlgorithmAsset,
    datasetOrderPrice,
    algoOrderPrice,
    algorithmSymbol,
    datasetSymbol,
    providerFeesSymbol,
    values.computeEnv, // Add this!
    allResourceValues // Add this!
  ])

  useEffect(() => {
    // Copy totalPrices so you don't mutate the original array
    const priceChecks = [...totalPrices]

    // Add C2D price if not already included in totalPrices
    const c2dPrice = allResourceValues?.[values.computeEnv]?.price
    const c2dSymbol = providerFeesSymbol
    // Only add if price > 0 and not present in totalPrices already (optional check)
    if (
      c2dPrice &&
      !totalPrices.some(
        (p) => p.symbol === c2dSymbol && p.value === c2dPrice.toString()
      )
    ) {
      priceChecks.push({ value: c2dPrice.toString(), symbol: c2dSymbol })
    }

    let sufficient = true
    for (const price of priceChecks) {
      const baseTokenBalance = getTokenBalanceFromSymbol(balance, price.symbol)
      if (
        !baseTokenBalance ||
        !compareAsBN(baseTokenBalance, `${price.value}`)
      ) {
        sufficient = false
        break
      }
    }
    setIsBalanceSufficient(sufficient)
  }, [
    balance,
    dtBalance,
    datasetSymbol,
    algorithmSymbol,
    providerFeesSymbol,
    totalPrices,
    allResourceValues,
    values.computeEnv
  ])

  const PurchaseButton = () => (
    <ButtonBuy
      action="compute"
      disabled={false}
      hasPreviousOrder={hasPreviousOrder}
      hasDatatoken={hasDatatoken}
      btSymbol={accessDetails.baseToken?.symbol}
      dtSymbol={accessDetails.datatoken?.symbol}
      dtBalance={dtBalance}
      assetTimeout={assetTimeout}
      assetType={asset.credentialSubject?.metadata.type}
      hasPreviousOrderSelectedComputeAsset={
        hasPreviousOrderSelectedComputeAsset
      }
      hasDatatokenSelectedComputeAsset={hasDatatokenSelectedComputeAsset}
      dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
      dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
      selectedComputeAssetType={selectedComputeAssetType}
      stepText={stepText}
      isLoading={isLoading}
      type="submit"
      priceType={accessDetails.type}
      algorithmPriceType={selectedAlgorithmAsset?.accessDetails?.[0]?.type}
      isBalanceSufficient={isBalanceSufficient}
      isConsumable={isConsumable}
      consumableFeedback={consumableFeedback}
      isAlgorithmConsumable={
        selectedAlgorithmAsset?.accessDetails?.[0]?.isPurchasable
      }
      isSupportedOceanNetwork={isSupportedOceanNetwork}
      hasProviderFee={providerFeeAmount && providerFeeAmount !== '0'}
      retry={retry}
      isAccountConnected={isConnected}
    />
  )

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>

      <div className={styles.contentContainer}>
        {/* Verification Progress Indicator */}
        {verificationQueue.length > 0 && (
          <div className={styles.progressContainer}>
            <div className={styles.progressLabel}>Verification Progress:</div>
            <div className={styles.progressSteps}>
              {verificationQueue.map((item, index) => (
                <div
                  key={item.id}
                  className={`${styles.progressStep} ${
                    item.isVerified
                      ? styles.completed
                      : index === currentVerificationIndex
                      ? styles.active
                      : styles.pending
                  }`}
                >
                  {item.type === 'dataset' ? 'Dataset' : 'Algorithm'}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.pricingBreakdown}>
          {/* Render all items from verification queue */}
          {verificationQueue.length === 0 ? (
            <div className={styles.loaderWrap}>
              <Loader message="Loading assets..." noMargin={true} />
            </div>
          ) : (
            verificationQueue.map((item, i) => (
              <PricingRow
                key={`${item.type}-${item.id}-${i}`}
                label={item.type === 'dataset' ? 'DATASET' : 'ALGORITHM'}
                itemName={item.name}
                value={item.price}
                duration={item.duration}
                actionLabel={`Check ${
                  item.type === 'dataset' ? 'Dataset' : 'Algorithm'
                } Credentials`}
                onAction={() => startVerification(i)}
                actionDisabled={item.isVerified}
                isService={true}
                credentialStatus={(() => {
                  const status = item.isVerified
                    ? 'verified'
                    : item.hasError
                    ? 'error'
                    : currentVerificationIndex === i
                    ? 'checking'
                    : 'pending'

                  return status
                })()}
              />
            ))
          )}

          {/* Compute items and market fees */}
          {computeItems.map((item) => (
            <PricingRow
              key={item.name}
              itemName={item.name}
              value={item.value}
              duration={item.duration}
            />
          ))}

          {marketFees.map((fee) => (
            <PricingRow key={fee.name} itemName={fee.name} value={fee.value} />
          ))}
        </div>

        {/* Total Payment Section */}
        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>YOU WILL PAY</span>
          <span className={styles.totalValue}>
            {isRequestingPrice ? (
              <span className={styles.totalValueNumber}>Calculating...</span>
            ) : totalPrices.length > 0 ? (
              <>
                <span className={styles.totalValueNumber}>
                  {totalPrices[0].value}
                </span>
                <span className={styles.totalValueSymbol}>
                  {' '}
                  {totalPrices[0].symbol}
                </span>
              </>
            ) : (
              <>
                <span className={styles.totalValueNumber}>0</span>
                <span className={styles.totalValueSymbol}> OCEAN</span>
              </>
            )}
          </span>
        </div>

        <div className={styles.termsSection}>
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
              disabled={false}
              hideLabel={true}
            />

            <Field
              component={Input}
              name="acceptPublishingLicense"
              type="checkbox"
              options={['Publishing License']}
              prefixes={['I agree the']}
              actions={['/publishing-license']}
              disabled={false}
              hideLabel={true}
            />
          </FormErrorGroup>
        </div>
        <PurchaseButton />
      </div>

      {/* Unified credentials modal */}
      {showCredentialsCheck && currentVerificationItem && (
        <div className={styles.credentialsOverlay}>
          <div className={styles.credentialsContainer}>
            <div className={styles.credentialsHeader}>
              <h3>
                Verify{' '}
                {currentVerificationItem.type === 'dataset'
                  ? 'Dataset'
                  : 'Algorithm'}{' '}
                Credentials
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowCredentialsCheck(false)}
              >
                ✕ Close
              </button>
            </div>
            <CredentialDialogProvider>
              {currentVerificationItem.type === 'dataset' ? (
                <AssetActionCheckCredentials
                  asset={currentVerificationItem.asset}
                  service={currentVerificationItem.service}
                  onVerified={handleVerificationComplete}
                  onError={handleVerificationError}
                />
              ) : (
                <AssetActionCheckCredentialsAlgo
                  asset={currentVerificationItem.asset}
                  service={currentVerificationItem.service}
                  onVerified={handleVerificationComplete}
                  onError={handleVerificationError}
                />
              )}
            </CredentialDialogProvider>
          </div>
        </div>
      )}
    </div>
  )
}
