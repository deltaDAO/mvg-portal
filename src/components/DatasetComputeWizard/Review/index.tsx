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
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import { consumeMarketOrderFee, consumeMarketFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { Asset } from 'src/@types/Asset'
import { useAsset } from '@context/Asset'
import ButtonBuy from '@components/Asset/AssetActions/ButtonBuy'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import Loader from '@components/@shared/atoms/Loader'
import { requiresSsi } from '@utils/credentials'
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
  const {
    isValid,
    setFieldValue,
    values,
    validateForm
  }: FormikContextType<FormComputeData> = useFormikContext()
  const { isAssetNetwork } = useAsset()

  const [verificationQueue, setVerificationQueue] = useState<
    VerificationItem[]
  >([])
  const [currentVerificationIndex, setCurrentVerificationIndex] =
    useState<number>(-1)
  const [showCredentialsCheck, setShowCredentialsCheck] =
    useState<boolean>(false)
  const [datasetOrderPrice, setDatasetOrderPrice] = useState<string | null>(
    accessDetails?.price
  )
  const [algoOrderPrice, setAlgoOrderPrice] = useState(
    selectedAlgorithmAsset?.accessDetails?.[0]?.price
  )
  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [totalPriceToDisplay, setTotalPriceToDisplay] = useState<string>('0')
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedEnvId = values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]

  const currentMode = paidResources?.mode === 'paid' ? 'paid' : 'free'
  const c2dPriceRaw =
    currentMode === 'paid' ? paidResources?.price : freeResources?.price

  const c2dPrice =
    c2dPriceRaw != null ? Math.round(Number(c2dPriceRaw) * 100) / 100 : 0

  // error message
  const errorMessages: string[] = []
  console.log('accessdetails!!!!', accessDetails)
  console.log('asset!!!!', asset)

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

  // Debug: Check what's actually in allResourceValues
  // console.log('Review Debug:', {
  //   selectedEnvId,
  //   allResourceValues,
  //   freeResources,
  //   paidResources,
  //   currentMode,
  //   c2dPrice
  // })
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

  useEffect(() => {
    const queue: VerificationItem[] = []

    if (asset && service) {
      const isVerified = lookupVerifierSessionId?.(asset.id, service.id)
      const datasetNeedsSsi =
        requiresSsi(asset?.credentialSubject?.credentials) ||
        requiresSsi(service?.credentials)
      const rawPrice = accessDetails?.validOrderTx ? '0' : accessDetails.price

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
        index: 0,
        price: rawPrice,
        duration: formatDuration(service.timeout || 0),
        name: service.name
      })
    }

    if (selectedAlgorithmAsset) {
      const algoService =
        selectedAlgorithmAsset.credentialSubject?.services?.[serviceIndex]
      const isVerified = lookupVerifierSessionId?.(
        selectedAlgorithmAsset.id,
        algoService?.id
      )

      const details = selectedAlgorithmAsset.accessDetails?.[serviceIndex]
      const rawPrice = details?.validOrderTx ? '0' : details?.price || '0'

      const algoNeedsSsi =
        requiresSsi(selectedAlgorithmAsset?.credentialSubject?.credentials) ||
        requiresSsi(algoService?.credentials)

      queue.push({
        id: selectedAlgorithmAsset.id,
        type: 'algorithm',
        asset: selectedAlgorithmAsset,
        service: algoService,
        status: algoNeedsSsi
          ? isVerified
            ? ('verified' as const)
            : ('unverified' as const)
          : ('verified' as const),
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

  useEffect(() => {
    const checkExpiration = () => {
      setVerificationQueue((prev) =>
        prev.map((item) => {
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

  const [credentialUpdateTrigger, setCredentialUpdateTrigger] = useState(0)

  useEffect(() => {
    const handleCredentialUpdate = () => {
      setCredentialUpdateTrigger((prev) => prev + 1)
    }

    window.addEventListener('credentialUpdated', handleCredentialUpdate)

    return () => {
      window.removeEventListener('credentialUpdated', handleCredentialUpdate)
    }
  }, [])
  function calculateDatasetMarketFee(
    consumeMarketFee: number | string,
    datasetPrice: number | string,
    maxDecimals: number
  ): string {
    return new Decimal(consumeMarketFee)
      .mul(new Decimal(datasetPrice || 0))
      .toDecimalPlaces(maxDecimals)
      .div(100)
      .toString()
  }
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

  const computeItems = [
    {
      name: 'C2D RESOURCES',
      value: c2dPrice ? c2dPrice.toString() : '0',
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
      value: calculateDatasetMarketFee(
        consumeMarketFee,
        accessDetails?.validOrderTx ? '0' : accessDetails?.price,
        MAX_DECIMALS
      )
    },
    {
      name: `COMMUNITY FEE ALGORITHM (${consumeMarketFee}%)`,
      value: calculateAlgorithmMarketFee(
        consumeMarketFee,
        algoOrderPrice ||
          selectedAlgorithmAsset?.accessDetails[serviceIndex]?.price ||
          0,
        MAX_DECIMALS
      )
    },
    {
      name: `COMMUNITY FEE C2D (${consumeMarketOrderFee}%)`,
      value: '0'
    }
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
    values.computeEnv,
    allResourceValues,
    c2dPrice
  ])

  useEffect(() => {
    // Copy totalPrices so you don't mutate the original array
    const priceChecks = [...totalPrices]

    // Add C2D price if not already included in totalPrices
    // Use the already calculated c2dPrice from above
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
        console.log('[compute-debug] Insufficient balance:', {
          symbol: price.symbol,
          required: price.value,
          available: baseTokenBalance,
          balance
        })
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
    c2dPrice
  ])
  useEffect(() => {
    const allVerified =
      verificationQueue.length > 0 &&
      verificationQueue.every((item) => item.status === 'verified')

    setFieldValue('credentialsVerified', allVerified, false)
    validateForm()
  }, [verificationQueue, setFieldValue, validateForm])

  useEffect(() => {
    console.log('[totalPriceToDisplay] Triggered useEffect')
    console.log('totalPrices:', totalPrices)
    console.log('consumeMarketFee:', consumeMarketFee)
    console.log('accessDetails.price:', accessDetails?.price)
    console.log('algoOrderPrice:', algoOrderPrice)
    console.log('selectedAlgorithmAsset:', selectedAlgorithmAsset)
    console.log('serviceIndex:', serviceIndex)

    if (!totalPrices || totalPrices.length === 0) {
      console.log(
        '[totalPriceToDisplay] totalPrices empty, skipping calculation'
      )
      return
    }

    const datasetFee = new Decimal(
      calculateDatasetMarketFee(
        consumeMarketFee,
        accessDetails?.validOrderTx ? '0' : accessDetails?.price,
        MAX_DECIMALS
      )
    )
    console.log('datasetFee:', datasetFee.toString())

    const algorithmFee = new Decimal(
      calculateAlgorithmMarketFee(
        consumeMarketFee,
        algoOrderPrice ||
          selectedAlgorithmAsset?.accessDetails?.[serviceIndex]?.price ||
          0,
        MAX_DECIMALS
      )
    )
    console.log('algorithmFee:', algorithmFee.toString())

    const sumTotalPrices = totalPrices.reduce((acc, item) => {
      console.log('Adding totalPrices item:', item)
      return acc.add(new Decimal(item.value || 0))
    }, new Decimal(0))
    console.log('sumTotalPrices:', sumTotalPrices.toString())

    const finalTotal = sumTotalPrices.add(datasetFee).add(algorithmFee)
    console.log(
      'finalTotal:',
      finalTotal.toDecimalPlaces(MAX_DECIMALS).toString()
    )

    setTotalPriceToDisplay(finalTotal.toDecimalPlaces(MAX_DECIMALS).toString())
  }, [
    totalPrices,
    consumeMarketFee,
    accessDetails?.price,
    algoOrderPrice,
    selectedAlgorithmAsset,
    serviceIndex
  ])

  const PurchaseButton = () => {
    const disabledConditions = {
      isComputeButtonDisabled,
      isValid,
      isBalanceSufficient,
      isAssetNetwork,
      isAlgorithmPurchasable:
        selectedAlgorithmAsset?.accessDetails?.[0]?.isPurchasable,
      isAccountIdWhitelisted
    }

    console.log(
      '[compute-debug] PurchaseButton disabled conditions:',
      disabledConditions
    )
    console.log(
      '[compute-debug] verificationQueue statuses:',
      verificationQueue.map((item) => ({
        id: item.id,
        type: item.type,
        status: item.status
      }))
    )
    console.log(
      '[compute-debug] credentialsVerified field value:',
      values.credentialsVerified
    )

    return (
      <ButtonBuy
        action="compute"
        disabled={
          isComputeButtonDisabled ||
          !isValid ||
          !isBalanceSufficient ||
          !isAssetNetwork ||
          !selectedAlgorithmAsset?.accessDetails?.[0]?.isPurchasable ||
          !isAccountIdWhitelisted
        }
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
        computeWizard={true}
      />
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          {/* Render all items from verification queue */}
          {!selectedAlgorithmAsset ? (
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
                  label={item.type === 'dataset' ? 'DATASET' : 'ALGORITHM'}
                  itemName={item.name}
                  value={item.price}
                  duration={item.duration}
                  {...(needsSsi
                    ? {
                        actionLabel: `Check ${
                          item.type === 'dataset' ? 'Dataset' : 'Algorithm'
                        } Credentials`,
                        onAction: () => startVerification(i),
                        actionDisabled: false
                      }
                    : {})}
                  isService={true}
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
      {/* <PurchaseButton /> */}

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
                  setCurrentVerificationIndex(-1)
                  setVerificationQueue((prev) =>
                    prev.map((item, i) =>
                      i === currentVerificationIndex
                        ? { ...item, status: 'failed' as const }
                        : item
                    )
                  )
                }}
              >
                ✕ Close
              </button>
            </div>
            <CredentialDialogProvider autoStart={true}>
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
