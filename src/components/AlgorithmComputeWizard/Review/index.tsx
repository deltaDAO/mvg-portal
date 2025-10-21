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
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import { consumeMarketOrderFee, consumeMarketFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import Loader from '@components/@shared/atoms/Loader'
import { requiresSsi } from '@utils/credentials'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useAsset } from '@context/Asset'

interface VerificationItem {
  id: string
  type: 'dataset' | 'algorithm'
  asset: AssetExtended
  service: Service
  status: 'verified' | 'checking' | 'failed' | 'unverified'
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
  datasets,
  selectedDatasetAsset,
  setSelectedDatasetAsset,
  selectedAlgorithmAsset,
  hasPreviousOrder,
  hasDatatoken,
  dtBalance,
  datasetSymbol,
  isAccountIdWhitelisted,
  algorithmSymbol,
  providerFeesSymbol,
  computeEnvs,
  isConsumable,
  algoOrderPriceAndFees,
  allResourceValues,
  setAllResourceValues
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  datasets: AssetSelectionAsset[]
  selectedDatasetAsset?: AssetExtended[]
  setSelectedDatasetAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended[]>
  >
  selectedAlgorithmAsset?: AssetExtended
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtBalance: string
  datasetSymbol?: string
  algorithmSymbol?: string
  providerFeesSymbol?: string
  computeEnvs: ComputeEnvironment[]
  isConsumable: boolean
  isAccountIdWhitelisted: boolean
  algoOrderPriceAndFees?: OrderPriceAndFees
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
}): ReactElement {
  console.log('accessdetails ', accessDetails)
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isAssetNetwork } = useAsset()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const {
    setFieldValue,
    values,
    validateForm
  }: FormikContextType<FormComputeData> = useFormikContext()

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

  const debugClick = () => {}

  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [totalPriceToDisplay, setTotalPriceToDisplay] = useState<string>('0')
  const selectedEnvId = values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]

  const currentMode = paidResources?.mode === 'paid' ? 'paid' : 'free'
  const c2dPriceRaw =
    currentMode === 'paid' ? paidResources?.price : freeResources?.price

  const c2dPrice =
    c2dPriceRaw != null ? Math.round(Number(c2dPriceRaw) * 100) / 100 : 0

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
  // error message
  const errorMessages: string[] = []

  // if (!isBalanceSufficient) {
  //   errorMessages.push(`You don't have enough OCEAN to make this purchase.`)
  // }
  // if (!isValid) {
  //   errorMessages.push('Form is not complete!')
  // }
  if (!isAssetNetwork) {
    errorMessages.push('This asset is not available on the selected network.')
  }
  if (
    selectedAlgorithmAsset?.accessDetails &&
    selectedAlgorithmAsset.accessDetails[0] &&
    !selectedAlgorithmAsset.accessDetails[0].isPurchasable
  ) {
    errorMessages.push('The selected algorithm asset is not purchasable.')
  }
  if (!isAccountIdWhitelisted) {
    errorMessages.push(
      'Your account is not whitelisted to purchase this asset.'
    )
  }
  useEffect(() => {
    const queue: VerificationItem[] = []

    selectedDatasetAsset?.forEach((asset, index) => {
      const service =
        asset.credentialSubject?.services?.[asset.serviceIndex || 0]
      const isVerified = lookupVerifierSessionId?.(asset.id, service?.id)
      const details = asset.accessDetails?.[asset.serviceIndex || 0]
      const rawPrice =
        details?.validOrderTx && details.validOrderTx !== ''
          ? '0'
          : details?.price || '0'

      const datasetNeedsSsi =
        requiresSsi(asset?.credentialSubject?.credentials) ||
        requiresSsi(service?.credentials)

      queue.push({
        id: asset.id,
        type: 'dataset',
        asset,
        service,
        status: datasetNeedsSsi
          ? isVerified
            ? ('verified' as const)
            : ('unverified' as const)
          : ('verified' as const),
        index,
        price: rawPrice,
        duration: '1 day', // Default duration for datasets
        name:
          asset.credentialSubject?.services?.[asset.serviceIndex || 0]?.name ||
          `Dataset ${queue.length + 1}`
      })
    })

    if (service && asset) {
      const isVerified = lookupVerifierSessionId?.(asset?.id, service.id)
      const rawPrice = asset.accessDetails?.[0].validOrderTx
        ? '0'
        : asset.accessDetails?.[0].price

      const algoNeedsSsi =
        requiresSsi(asset?.credentialSubject?.credentials) ||
        requiresSsi(service?.credentials)

      queue.push({
        id: asset.id,
        type: 'algorithm',
        asset,
        service,
        status: algoNeedsSsi
          ? isVerified
            ? ('verified' as const)
            : ('unverified' as const)
          : ('verified' as const),
        index: queue.length,
        price: rawPrice,
        duration: formatDuration(service.timeout || 0),
        name: service.name
      })
    }

    setVerificationQueue(queue)
  }, [selectedDatasetAsset, asset, service, lookupVerifierSessionId])

  useEffect(() => {
    const checkExpiration = () => {
      setVerificationQueue((prev) =>
        prev.map((item) => {
          // Only apply expiration checks for items that actually require SSI
          const needsSsi =
            requiresSsi(item.asset?.credentialSubject?.credentials) ||
            requiresSsi(item.service?.credentials)

          if (
            needsSsi &&
            item.status === 'verified' &&
            item.asset?.id &&
            item.service?.id
          ) {
            const credentialKey = `credential_${item.asset.id}_${item.service.id}`
            const storedTimestamp =
              typeof window !== 'undefined' && window.localStorage
                ? window.localStorage.getItem(credentialKey)
                : null

            if (storedTimestamp) {
              const timestamp = parseInt(storedTimestamp, 10)
              const now = Date.now()
              const isExpired = now - timestamp > 5 * 60 * 1000 // 5 minutes

              if (isExpired) {
                return { ...item, status: 'failed' as const }
              }
            } else {
              return { ...item, status: 'failed' as const }
            }
          }
          return item
        })
      )
    }

    checkExpiration()
    const interval = setInterval(checkExpiration, 10000)

    return () => clearInterval(interval)
  }, [])

  const startVerification = (index: number) => {
    const hasExpiredCredentials = verificationQueue.some(
      (item) => item.status === 'failed'
    )

    if (hasExpiredCredentials) {
      const expiredIndices = verificationQueue
        .map((item, i) => ({ item, index: i }))
        .filter(({ item }) => item.status === 'failed')
        .map(({ index }) => index)

      const firstExpiredIndex = expiredIndices[0]
      if (firstExpiredIndex !== undefined) {
        setVerificationQueue((prev) =>
          prev.map((item, i) =>
            i === firstExpiredIndex
              ? { ...item, status: 'checking' as const }
              : item
          )
        )
        setCurrentVerificationIndex(firstExpiredIndex)
        setShowCredentialsCheck(true)
      }
    } else {
      setVerificationQueue((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, status: 'checking' as const } : item
        )
      )
      setCurrentVerificationIndex(index)
      setShowCredentialsCheck(true)
    }
  }

  const handleVerificationComplete = () => {
    const currentItem = verificationQueue[currentVerificationIndex]
    if (currentItem) {
      const credentialKey = `credential_${currentItem.asset.id}_${currentItem.service.id}`
      const timestamp = Date.now().toString()
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(credentialKey, timestamp)
        window.dispatchEvent(
          new CustomEvent('credentialUpdated', {
            detail: { credentialKey }
          })
        )
      }
    }

    setVerificationQueue((prev) => {
      const updatedQueue = prev.map((item, i) =>
        i === currentVerificationIndex
          ? { ...item, status: 'verified' as const }
          : item
      )

      const hasExpiredCredentials = updatedQueue.some(
        (item) =>
          item.status === 'failed' &&
          item.asset?.id &&
          item.service?.id &&
          typeof window !== 'undefined' &&
          window.localStorage &&
          window.localStorage.getItem(
            `credential_${item.asset.id}_${item.service.id}`
          ) !== null
      )

      let nextIndex = -1

      if (hasExpiredCredentials) {
        nextIndex = updatedQueue.findIndex(
          (item, index) =>
            index > currentVerificationIndex &&
            item.status === 'failed' &&
            item.asset?.id &&
            item.service?.id &&
            typeof window !== 'undefined' &&
            window.localStorage &&
            window.localStorage.getItem(
              `credential_${item.asset.id}_${item.service.id}`
            ) !== null
        )
      } else {
        nextIndex = updatedQueue.findIndex(
          (item, index) =>
            index > currentVerificationIndex && item.status !== 'verified'
        )
      }

      if (nextIndex !== -1) {
        setTimeout(() => startVerification(nextIndex), 300)
      }

      return updatedQueue
    })
    setShowCredentialsCheck(false)
    setCurrentVerificationIndex(-1)
  }

  const handleVerificationError = () => {
    setVerificationQueue((prev) =>
      prev.map((item, i) =>
        i === currentVerificationIndex
          ? { ...item, status: 'failed' as const }
          : item
      )
    )
    setShowCredentialsCheck(false)
    setCurrentVerificationIndex(-1)
  }

  const currentVerificationItem = verificationQueue[currentVerificationIndex]
  function calculateAlgorithmMarketFee(
    consumeMarketFee: number | string,
    algorithmPrice: number | string,
    maxDecimals: number
  ): string {
    return new Decimal(consumeMarketFee)
      .mul(new Decimal(algorithmPrice || 0))
      .toDecimalPlaces(maxDecimals)
      .div(100)
      .toString()
  }
  // --- Calculate market fees for multiple datasets + one algorithm ---
  const totalDatasetMarketFee =
    selectedDatasetAsset?.reduce((acc, dataset) => {
      const index = dataset.serviceIndex || 0
      const details = dataset.accessDetails?.[index]
      const datasetPrice = details?.validOrderTx ? '0' : details?.price || '0'

      const fee = new Decimal(consumeMarketFee)
        .mul(new Decimal(datasetPrice))
        .toDecimalPlaces(MAX_DECIMALS)
        .div(100)

      return acc.add(fee)
    }, new Decimal(0)) || new Decimal(0)

  // Algorithm fee
  const algorithmMarketFee = new Decimal(
    calculateAlgorithmMarketFee(
      consumeMarketFee,
      accessDetails.validOrderTx ? '0' : accessDetails?.price,
      MAX_DECIMALS
    )
  )

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
    {
      name: `COMMUNITY FEE DATASET (${consumeMarketFee}%)`,
      value: totalDatasetMarketFee.toDecimalPlaces(MAX_DECIMALS).toString()
    },
    {
      name: `COMMUNITY FEE ALGORITHM (${consumeMarketFee}%)`,
      value: algorithmMarketFee.toDecimalPlaces(MAX_DECIMALS).toString()
    },
    {
      name: `COMMUNITY FEE C2D (${consumeMarketOrderFee}%)`,
      value: '0'
    }
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
    // Defensive check — ensure datasets is an array before mapping
    if (!Array.isArray(datasets) || datasets.length === 0) {
      console.warn(
        '[getDatasetAssets] datasets is not an array or is empty:',
        datasets
      )
      return { assets: [], services: [] }
    }
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
  }, [datasets, computeEnvs, setFieldValue, values.algorithm])

  useEffect(() => {
    if (!values.dataset || !isConsumable) return

    async function fetchDatasetAssetsExtended() {
      const { assets, services } = await getDatasetAssets(values.dataset)
      setSelectedDatasetAsset(assets)
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
  useEffect(() => {
    const allVerified =
      verificationQueue.length > 0 &&
      verificationQueue.every((item) => item.status === 'verified')

    setFieldValue('credentialsVerified', allVerified, false)
    validateForm()
  }, [verificationQueue, setFieldValue, validateForm])

  useEffect(() => {
    try {
      // Parse dataset + algorithm market fees
      const datasetMarketFeeTotal = new Decimal(marketFees[0]?.value || '0')
      const algorithmMarketFeeTotal = new Decimal(marketFees[1]?.value || '0')

      // Sum all prices from totalPrices array (extract 'value')
      const totalPricesSum = totalPrices.reduce(
        (acc, val) => acc.add(new Decimal(val.value || 0)),
        new Decimal(0)
      )

      // Final combined total
      const displayTotal = totalPricesSum
        .add(datasetMarketFeeTotal)
        .add(algorithmMarketFeeTotal)
        .toDecimalPlaces(MAX_DECIMALS)

      setTotalPriceToDisplay(displayTotal.toString())

      console.log('--- PRICE DEBUG ---')
      console.log('Total Prices:', totalPrices)
      console.log('Dataset Market Fee:', datasetMarketFeeTotal.toString())
      console.log('Algorithm Market Fee:', algorithmMarketFeeTotal.toString())
      console.log('Final Total to Display:', displayTotal.toString())
    } catch (error) {
      console.error('Error calculating totalPriceToDisplay:', error)
    }
  }, [totalPrices, marketFees])

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
            verificationQueue.map((item, i) => {
              const hasSsiPolicy =
                requiresSsi(item.asset?.credentialSubject?.credentials) ||
                requiresSsi(item.service?.credentials)
              const needsSsi = hasSsiPolicy || item.service

              return (
                <PricingRow
                  key={`${item.type}-${item.id}-${i}`}
                  label={
                    item.type === 'dataset' ? `Dataset ${i + 1}` : 'ALGORITHM'
                  }
                  itemName={item.name}
                  value={item.price}
                  duration={item.duration}
                  {...(needsSsi
                    ? {
                        actionLabel: `Check ${
                          item.type === 'dataset' ? 'Dataset' : 'Algorithm'
                        } credentials`,
                        onAction: () => startVerification(i),
                        actionDisabled: false
                      }
                    : {})}
                  isService={item.type === 'algorithm'}
                  infoMessage={
                    !hasSsiPolicy
                      ? 'No credentials required (never expires)'
                      : undefined
                  }
                  credentialStatus={item.status}
                  assetId={item.asset?.id}
                  serviceId={item.service?.id}
                  onCredentialRefresh={() => startVerification(i)}
                />
              )
            })
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
                  {/* {totalPrices[0].value} */}
                  {totalPriceToDisplay}
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
        {errorMessages.length > 0 && (
          <div className={styles.errorMessage}>
            <ul>
              {errorMessages.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

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
                        ? { ...item, status: 'failed' as const }
                        : item
                    )
                  )
                  setCurrentVerificationIndex(-1)
                }}
              >
                ✕ Close
              </button>
            </div>
            <CredentialDialogProvider autoStart={true}>
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
