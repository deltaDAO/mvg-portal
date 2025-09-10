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
  status: 'verified' | 'checking' | 'failed'
  index: number
  price: string
  duration: string
  name: string
}

export default function Review({
  isRequestingPrice = false,
  asset,
  service,
  isAlgorithm = false,
  accessDetails,
  datasets,
  selectedDatasetAsset,
  setSelectedDatasetAsset,
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
  allResourceValues,
  ddoListAlgorithms,
  setAllResourceValues
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  datasets: AssetSelectionAsset[]
  selectedDatasetAsset?: AssetExtended[]
  ddoListAlgorithms?: Asset[]
  setSelectedDatasetAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended[]>
  >
  selectedAlgorithmAsset?: AssetExtended
  setSelectedAlgorithmAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended>
  >
  isLoading: boolean
  isComputeButtonDisabled: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtBalance: string
  assetTimeout: string
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
  computeEnvs: ComputeEnvironment[]
  stepText: string
  isConsumable: boolean
  consumableFeedback: string
  datasetOrderPriceAndFees?: OrderPriceAndFees
  algoOrderPriceAndFees?: OrderPriceAndFees
  providerFeeAmount?: string
  validUntil?: string
  retry: boolean
  allResourceValues?: {
    [envId: string]: ResourceType
  }
  setAllResourceValues?: React.Dispatch<
    React.SetStateAction<{
      [envId: string]: ResourceType
    }>
  >
  totalPrices?: { value: string; symbol: string }[]
  datasetOrderPrice?: string
  algoOrderPrice?: string
  c2dPrice?: string
  isRequestingPrice?: boolean
  isAlgorithm?: boolean
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
  const [algoOrderPrice, setAlgoOrderPrice] = useState<string | null>(
    selectedAlgorithmAsset?.accessDetails?.[0]?.price ??
      accessDetails.price ??
      null
  )
  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedEnvId = values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]

  // Determine current mode from the resource values
  const currentMode = paidResources?.mode === 'paid' ? 'paid' : 'free'
  const c2dPrice =
    currentMode === 'paid' ? paidResources?.price : freeResources?.price
  const [allDatasetServices, setAllDatasetServices] = useState<Service[]>([])
  const [datasetVerificationIndex, setDatasetVerificationIndex] = useState(0)
  const [activeCredentialAsset, setActiveCredentialAsset] = useState<any>(null)
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
  // Build verification queue from datasets and algorithm
  useEffect(() => {
    const queue: VerificationItem[] = []

    // Add datasets to queue
    selectedDatasetAsset?.forEach((asset, index) => {
      const service =
        asset.credentialSubject?.services?.[asset.serviceIndex || 0]
      const isVerified = lookupVerifierSessionId?.(asset.id, service?.id)
      const details = asset.accessDetails?.[asset.serviceIndex || 0]
      const rawPrice =
        details?.validOrderTx && details.validOrderTx !== ''
          ? '0'
          : details?.price || '0'

      queue.push({
        id: asset.id,
        type: 'dataset',
        asset,
        service,
        status: isVerified ? 'verified' : 'failed',
        index,
        price: rawPrice,
        duration: '1 day', // Default duration for datasets
        name:
          asset.credentialSubject?.services?.[0]?.name || `Dataset ${index + 1}`
      })
    })

    if (service && asset) {
      const isVerified = lookupVerifierSessionId?.(asset?.id, service.id)
      const rawPrice = asset.accessDetails?.[0].validOrderTx
        ? '0'
        : asset.accessDetails?.[0].price

      queue.push({
        id: asset.id,
        type: 'algorithm',
        asset,
        service,
        status: isVerified ? 'verified' : 'failed',
        index: queue.length,
        price: rawPrice,
        duration: formatDuration(service.timeout || 0),
        name: service.name
      })
    }

    setVerificationQueue(queue)
  }, [selectedDatasetAsset, asset, service, lookupVerifierSessionId])

  // Start verification for a specific item
  const startVerification = (index: number) => {
    setVerificationQueue((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, status: 'checking' } : item
      )
    )
    setCurrentVerificationIndex(index)
    setShowCredentialsCheck(true)
  }

  // Handle verification completion
  const handleVerificationComplete = () => {
    setVerificationQueue((prev) =>
      prev.map((item, i) =>
        i === currentVerificationIndex ? { ...item, status: 'verified' } : item
      )
    )
    setShowCredentialsCheck(false)
    setCurrentVerificationIndex(-1)

    // Proceed to next unverified item
    const nextIndex = verificationQueue.findIndex(
      (item, index) =>
        index > currentVerificationIndex && item.status === 'failed'
    )
    if (nextIndex !== -1) {
      setTimeout(() => startVerification(nextIndex), 300)
    }
  }

  // Handle verification error
  const handleVerificationError = () => {
    setVerificationQueue((prev) =>
      prev.map((item, i) =>
        i === currentVerificationIndex ? { ...item, status: 'failed' } : item
      )
    )
    setShowCredentialsCheck(false)
    setCurrentVerificationIndex(-1)
    // Stop verification on error
  }

  // Get current item being verified
  const currentVerificationItem = verificationQueue[currentVerificationIndex]

  const [datasetOrderPrice, setDatasetOrderPrice] = useState<string | null>(
    accessDetails.price
  )

  const selectedDatasets = Array.isArray(values?.datasets)
    ? values.datasets
    : []

  // const [credentialCheckTarget, setCredentialCheckTarget] =
  //   useState<CredentialTarget>(null)

  function DatasetCredentialsOverlay({
    did,
    serviceId
  }: {
    did: string
    serviceId?: string
  }) {
    const [targetAsset, setTargetAsset] = useState<AssetExtended | null>(null)
    const [targetService, setTargetService] = useState<Service | null>(null)

    useEffect(() => {
      let cancelled = false
      async function load() {
        try {
          const assetObj = await getAsset(did, newCancelToken())
          if (!assetObj) return

          // Resolve selected serviceId from form values.dataset first (authoritative)
          const datasetPair = (values?.dataset || []).find(
            (pair: string) =>
              typeof pair === 'string' && pair.startsWith(`${did}|`)
          )
          const selectedSvcIdFromPairs = datasetPair
            ? datasetPair.split('|')[1]
            : undefined
          // Fallback to any checked service in values.datasets
          const ds = (selectedDatasets || []).find((d: any) => d.id === did)
          const selectedSvcId =
            serviceId ||
            selectedSvcIdFromPairs ||
            ds?.services?.find((s: any) => s.checked)?.id
          const svc =
            assetObj?.credentialSubject?.services?.find(
              (s: any) => s.id === selectedSvcId
            ) || assetObj?.credentialSubject?.services?.[0]

          if (!cancelled) {
            setTargetAsset(assetObj as any)
            setTargetService(svc as any)
          }
        } catch (e) {
          // ignore
        }
      }
      load()
      return () => {
        cancelled = true
      }
    }, [did, serviceId])

    if (!targetAsset || !targetService) {
      return <div>Loading...</div>
    }
    return (
      <CredentialDialogProvider>
        <AssetActionCheckCredentialsAlgo
          asset={targetAsset}
          service={targetService}
          type="dataset"
          onVerified={() => {
            setShowCredentialsCheck(false)
            // setCredentialCheckTarget(null)
          }}
        />
      </CredentialDialogProvider>
    )
  }

  const computeItems = [
    {
      name: 'C2D RESOURCES',
      value: c2dPrice || '0',
      duration: formatDuration(
        currentMode === 'paid'
          ? (paidResources?.jobDuration || 0) * 60 // Convert minutes to seconds
          : (freeResources?.jobDuration || 0) * 60 // Convert minutes to seconds
      )
    }
  ]

  const marketFees = [
    { name: 'CONSUME MARKET ORDER FEE DATASET (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE ALGORITHM (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE C2C (0%)', value: '0' }
  ]

  useEffect(() => {
    if (!asset || !service?.id || !asset.credentialSubject?.services?.length)
      return

    const index = asset.credentialSubject.services.findIndex(
      (svc) => svc.id === service.id
    )

    if (index !== -1) setServiceIndex(index)
  }, [asset, service])

  async function getDatasetAssets(datasets: string[]): Promise<{
    assets: AssetExtended[]
    services: Service[]
  }> {
    const newCancelTokenInstance = newCancelToken()
    const servicesCollected: Service[] = []

    const assets = await Promise.all(
      datasets.map(async (item) => {
        const [datasetId, serviceId] = item.split('|')

        try {
          const asset = await getAsset(datasetId, newCancelTokenInstance)
          if (!asset || !asset.credentialSubject?.services?.length) return null

          const serviceIndex = asset.credentialSubject.services.findIndex(
            (svc: any) => svc.id === serviceId
          )

          const accessDetailsList = await Promise.all(
            asset.credentialSubject.services.map((service) =>
              getAccessDetails(
                asset.credentialSubject.chainId,
                service,
                accountId,
                newCancelTokenInstance
              )
            )
          )

          const extendedAsset: AssetExtended = {
            ...asset,
            accessDetails: accessDetailsList,
            serviceIndex: serviceIndex !== -1 ? serviceIndex : null
          }

          if (serviceIndex !== -1) {
            servicesCollected.push(
              asset.credentialSubject.services[serviceIndex]
            )
          }

          return extendedAsset
        } catch (error) {
          console.error(`Error processing dataset ${datasetId}:`, error)
          return null
        }
      })
    )

    return {
      assets: assets.filter(Boolean) as AssetExtended[],
      services: servicesCollected
    }
  }

  // Pre-select computeEnv and/or dataset if there is only one available option
  useEffect(() => {
    if (computeEnvs?.length === 1 && !values.computeEnv) {
      setFieldValue('computeEnv', computeEnvs[0], true)
    }
    if (
      datasets?.length === 1 &&
      !values.algorithm &&
      datasets?.[0]?.isAccountIdWhitelisted
    ) {
      const { did } = datasets[0]
      setFieldValue('dataset', did, true)
    }
  }, [
    datasets,
    computeEnvs,
    setFieldValue,
    values.algorithm
    // Removed values.computeEnv from dependencies to prevent infinite loop
  ])

  useEffect(() => {
    if (!values.dataset || !isConsumable) return

    async function fetchDatasetAssetsExtended() {
      const { assets, services } = await getDatasetAssets(values.dataset)
      setSelectedDatasetAsset(assets)
      setAllDatasetServices(services)
    }

    fetchDatasetAssetsExtended()
  }, [values.dataset, accountId, isConsumable])

  useEffect(() => {
    if (!values.computeEnv) return

    const selectedEnv = values.computeEnv
    if (!selectedEnv?.id) return

    // if not already initialized, set default resource values for both free and paid modes
    if (
      !allResourceValues[`${selectedEnv.id}_free`] &&
      !allResourceValues[`${selectedEnv.id}_paid`]
    ) {
      const cpu = selectedEnv.resources.find((r) => r.id === 'cpu')?.min || 1
      const ram =
        selectedEnv.resources.find((r) => r.id === ('ram' as any))?.min ||
        1_000_000_000
      const disk =
        selectedEnv.resources.find((r) => r.id === ('disk' as any))?.min ||
        1_000_000_000
      const jobDuration = selectedEnv.maxJobDuration || 3600

      const freeRes = {
        cpu: 0,
        ram: 0,
        disk: 0,
        jobDuration: 0,
        price: 0,
        mode: 'free'
      }

      const paidRes = {
        cpu,
        ram,
        disk,
        jobDuration,
        price: 0,
        mode: 'paid'
      }

      setAllResourceValues((prev) => ({
        ...prev,
        [`${selectedEnv.id}_free`]: freeRes,
        [`${selectedEnv.id}_paid`]: paidRes
      }))
    }
  }, [values.computeEnv])

  //
  // Set price for calculation output
  //
  useEffect(() => {
    if (!asset?.accessDetails || !selectedDatasetAsset?.length) return

    setAlgoOrderPrice(algoOrderPriceAndFees?.price || accessDetails.price)

    const totalPrices: totalPriceMap[] = []

    let datasetPrice = new Decimal(0)
    let datasetFee = new Decimal(0)
    let datasetOrderPriceSum = new Decimal(0) // nou

    selectedDatasetAsset.forEach((dataset) => {
      const index = dataset.serviceIndex || 0
      const details = dataset.accessDetails?.[index]

      const rawPrice = details?.validOrderTx ? '0' : details?.price || '0'
      const price = new Decimal(rawPrice).toDecimalPlaces(MAX_DECIMALS)
      const fee = new Decimal(consumeMarketOrderFee).mul(price).div(100)

      datasetPrice = datasetPrice.add(price)
      datasetFee = datasetFee.add(fee)

      datasetOrderPriceSum = datasetOrderPriceSum.add(price)
    })

    setDatasetOrderPrice(
      datasetOrderPriceSum.toDecimalPlaces(MAX_DECIMALS).toString()
    )

    const priceDataset = datasetPrice
    const feeDataset = datasetFee

    const priceAlgo =
      !algoOrderPrice || hasPreviousOrder || hasDatatoken
        ? new Decimal(0)
        : new Decimal(algoOrderPrice).toDecimalPlaces(MAX_DECIMALS)

    const feeAlgo = new Decimal(consumeMarketOrderFee).mul(priceAlgo).div(100)

    const priceC2D =
      c2dPrice !== undefined
        ? new Decimal(c2dPrice).toDecimalPlaces(MAX_DECIMALS)
        : new Decimal(0)

    const feeC2D = new Decimal(consumeMarketOrderFee).mul(priceC2D).div(100)

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
  }, [
    serviceIndex,
    selectedDatasetAsset,
    accessDetails.price,
    algoOrderPrice,
    algoOrderPriceAndFees?.price,
    algorithmSymbol,
    asset?.accessDetails,
    c2dPrice,
    datasetSymbol,
    hasDatatoken,
    hasPreviousOrder,
    providerFeesSymbol
  ])

  useEffect(() => {
    // Copy totalPrices so you don't mutate the original array
    const priceChecks = [...totalPrices]

    // Add C2D price if not already included in totalPrices
    const selectedEnvId = values?.computeEnv?.id
    const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
    const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]
    const c2dPrice =
      values?.mode === 'paid' ? paidResources?.price : freeResources?.price
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
    values.computeEnv,
    values?.mode
  ])

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          {/* Render all items from verification queue */}
          {selectedDatasetAsset.length === 0 ? (
            <div className={styles.loaderWrap}>
              <Loader message="Loading assets..." noMargin={true} />
            </div>
          ) : (
            verificationQueue.map((item, i) => (
              <PricingRow
                key={`${item.type}-${item.id}-${i}`}
                label={
                  item.type === 'dataset' ? `Dataset ${i + 1}` : 'ALGORITHM'
                }
                itemName={item.name}
                value={item.price}
                duration={item.duration}
                actionLabel={`Check ${
                  item.type === 'dataset' ? 'Dataset' : 'Algorithm'
                } credentials`}
                onAction={() => startVerification(i)}
                actionDisabled={item.status === 'verified'}
                isService={item.type === 'algorithm'}
                credentialStatus={item.status}
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
                onClick={() => {
                  setShowCredentialsCheck(false)
                  setVerificationQueue((prev) =>
                    prev.map((item, i) =>
                      i === currentVerificationIndex
                        ? { ...item, status: 'failed' }
                        : item
                    )
                  )
                  setCurrentVerificationIndex(-1)
                }}
              >
                ✕ Close
              </button>
            </div>
            <CredentialDialogProvider>
              {currentVerificationItem.type === 'dataset' ? (
                <AssetActionCheckCredentialsAlgo
                  asset={currentVerificationItem.asset}
                  service={currentVerificationItem.service}
                  onVerified={handleVerificationComplete}
                  onError={handleVerificationError}
                />
              ) : (
                <AssetActionCheckCredentials
                  asset={currentVerificationItem.asset as any}
                  service={currentVerificationItem.service as any}
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
