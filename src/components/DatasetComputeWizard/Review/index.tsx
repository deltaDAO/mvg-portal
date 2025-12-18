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
import { useAccount, useChainId } from 'wagmi'
import useBalance from '@hooks/useBalance'
import { useSsiWallet } from '@context/SsiWallet'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import { consumeMarketOrderFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol, getTokenInfo } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { Asset } from 'src/@types/Asset'
import { useAsset } from '@context/Asset'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import Loader from '@components/@shared/atoms/Loader'
import { requiresSsi } from '@utils/credentials'
import { Signer, formatUnits } from 'ethers'
import { getOceanConfig } from '@utils/ocean'
import { getFixedBuyPrice } from '@utils/ocean/fixedRateExchange'
import { useUserPreferences } from '@context/UserPreferences'
interface VerificationItem {
  id: string
  type: 'dataset' | 'algorithm'
  asset: AssetExtended
  service: Service
  status: 'verified' | 'checking' | 'failed' | 'expired' | 'unverified'
  index: number
  price: string
  duration: string
  name: string
}

export default function Review({
  isRequestingPrice = false,
  asset,
  service,
  signer,
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
  refetchJobs,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient
}: {
  asset?: AssetExtended
  service?: Service
  signer?: Signer
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
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient?: boolean
  setIsBalanceSufficient?: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  const { address: accountId } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const chainId = useChainId()
  const { privacyPolicySlug } = useUserPreferences()

  const [symbol, setSymbol] = useState('')

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)
  const [algoOecFee, setAlgoOecFee] = useState<string>('0')
  const [datasetOecFees, setDatasetOecFees] = useState<string>('0')
  const {
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
  const [datasetProviderFee, setDatasetProviderFee] = useState(
    datasetProviderFeeProp || null
  )
  const [algorithmProviderFee, setAlgorithmProviderFee] = useState(
    algorithmProviderFeeProp || null
  )
  const [totalPrices, setTotalPrices] = useState([])
  const [totalPriceToDisplay, setTotalPriceToDisplay] = useState<string>('0')
  const selectedEnvId = values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]

  const currentMode = values?.mode || 'free'
  const c2dPriceRaw =
    currentMode === 'paid' ? paidResources?.price : freeResources?.price

  const c2dPrice =
    c2dPriceRaw != null ? Math.round(Number(c2dPriceRaw) * 100) / 100 : 0

  // error message
  const errorMessages: string[] = []

  if (!isBalanceSufficient) {
    errorMessages.push(`You don't have enough ${symbol} to make this purchase.`)
  }

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
    async function fetchPrices() {
      if (
        asset &&
        asset.credentialSubject?.chainId &&
        accessDetails &&
        signer &&
        !accessDetails.isOwned
      ) {
        try {
          // For algorithm
          const datasetFixed = await getFixedBuyPrice(
            accessDetails,
            asset.credentialSubject.chainId,
            signer
          )
          setDatasetOecFees(datasetFixed?.oceanFeeAmount || '0')
        } catch (e) {
          console.error('Could not fetch dataset fixed buy price:', e)
        }
      }
      if (
        selectedAlgorithmAsset &&
        !selectedAlgorithmAsset.accessDetails[serviceIndex].isOwned
      ) {
        try {
          const algoFixed = await getFixedBuyPrice(
            selectedAlgorithmAsset?.accessDetails[serviceIndex],
            selectedAlgorithmAsset?.credentialSubject.chainId,
            signer
          )
          setAlgoOecFee(algoFixed?.oceanFeeAmount || '0')
        } catch (e) {
          console.error('Could not fetch algo fixed buy price sum:', e)
        }
      }
    }

    fetchPrices()
    // Add relevant dependencies, ensure signer and assets are set
  }, [asset, accessDetails, signer, selectedAlgorithmAsset])

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!chainId || !signer?.provider) return

      const { oceanTokenAddress } = getOceanConfig(chainId)
      const tokenDetails = await getTokenInfo(
        oceanTokenAddress,
        signer.provider
      )

      setTokenInfo(tokenDetails)
      setSymbol(tokenDetails.symbol || 'OCEAN')
    }

    fetchTokenDetails()
  }, [chainId, signer])

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
      const rawPrice = accessDetails?.validOrderTx ? '0' : accessDetails.price

      queue.push({
        id: asset.id,
        type: 'dataset',
        asset,
        service,
        status: isVerified ? ('verified' as const) : ('unverified' as const),
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

      queue.push({
        id: selectedAlgorithmAsset.id,
        type: 'algorithm',
        asset: selectedAlgorithmAsset,
        service: algoService,
        status: isVerified ? ('verified' as const) : ('unverified' as const),
        index: queue.length,
        price: rawPrice,
        duration: '1 day',
        name:
          selectedAlgorithmAsset.credentialSubject?.services?.[serviceIndex]
            ?.name || 'Algorithm'
      })
    }

    setVerificationQueue(queue)
  }, [asset, service, selectedAlgorithmAsset, serviceIndex])

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
                return { ...item, status: 'expired' as const }
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
      (item) => item.status === 'failed' || item.status === 'expired'
    )

    if (hasExpiredCredentials) {
      const expiredIndices = verificationQueue
        .map((item, i) => ({ item, index: i }))
        .filter(
          ({ item }) => item.status === 'failed' || item.status === 'expired'
        )
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
          item.status === 'failed' ||
          (item.status === 'expired' &&
            item.asset?.id &&
            item.service?.id &&
            typeof window !== 'undefined' &&
            window.localStorage &&
            window.localStorage.getItem(
              `credential_${item.asset.id}_${item.service.id}`
            ) !== null)
      )

      let nextIndex = -1

      if (hasExpiredCredentials) {
        nextIndex = updatedQueue.findIndex(
          (item, index) =>
            (index > currentVerificationIndex && item.status === 'failed') ||
            (item.status === 'expired' &&
              item.asset?.id &&
              item.service?.id &&
              typeof window !== 'undefined' &&
              window.localStorage &&
              window.localStorage.getItem(
                `credential_${item.asset.id}_${item.service.id}`
              ) !== null)
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

  const computeItems = [
    {
      name: 'C2D RESOURCES',
      value: values.jobPrice || '0',
      duration: formatDuration(
        currentMode === 'paid'
          ? (paidResources?.jobDuration || 0) * 60
          : (freeResources?.jobDuration || 0) * 60
      )
    }
  ]
  const escrowFunds = [
    {
      name: 'AMOUNT AVAILABLE IN THE ESCROW ACCOUNT',
      value: Number(values.escrowFunds).toFixed(3) || '0'
    }
  ]
  const amountDeposit = [
    {
      name: 'AMOUNT TO DEPOSIT IN THE ESCROW ACCOUNT',
      value: c2dPrice ? c2dPrice.toString() : '0'
    }
  ]
  const datasetProviderFees = [
    {
      name: 'PROVIDER FEE DATASET',
      value: datasetProviderFee
        ? formatUnits(datasetProviderFee, tokenInfo?.decimals)
        : '0'
    }
  ]
  const algorithmProviderFees = [
    {
      name: 'PROVIDER FEE ALGORITHM',
      value: algorithmProviderFee
        ? formatUnits(algorithmProviderFee, tokenInfo?.decimals)
        : '0'
    }
  ]

  const marketFees = [
    {
      name: `MARKETPLACE ORDER FEE DATASET`,
      value: accessDetails?.isOwned
        ? '0'
        : new Decimal(
            formatUnits(consumeMarketOrderFee, tokenInfo?.decimals)
          ).toString()
    },
    {
      name: `MARKETPLACE ORDER FEE ALGORITHM`,
      value: selectedAlgorithmAsset?.accessDetails?.[serviceIndex]?.isOwned
        ? '0'
        : new Decimal(
            formatUnits(consumeMarketOrderFee, tokenInfo?.decimals)
          ).toString()
    },
    {
      name: `OEC FEE DATASET`,
      value: accessDetails?.isOwned ? '0' : datasetOecFees.toString()
    },
    {
      name: `OEC FEE ALGORITHM`,
      value: selectedAlgorithmAsset?.accessDetails?.[serviceIndex]?.isOwned
        ? '0'
        : algoOecFee.toString()
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
    const feeAlgo = selectedAlgorithmAsset?.accessDetails?.[serviceIndex]
      ?.isOwned
      ? new Decimal(0)
      : new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))
    const feeDataset = accessDetails?.isOwned
      ? new Decimal(0)
      : new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))

    // This part determines how you aggregate, but **always use priceC2D instead of providerFeeAmount/providerFees**
    if (algorithmSymbol === providerFeesSymbol) {
      let sum = priceC2D.add(priceAlgo).add(feeAlgo)
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
        const sum = priceC2D.add(priceDataset).add(feeDataset)
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
          value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
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
          value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
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
    const filteredPriceChecks = priceChecks.filter(
      (price) => price.value !== '0'
    )
    for (const price of filteredPriceChecks) {
      const baseTokenBalance = getTokenBalanceFromSymbol(balance, price.symbol)

      if (
        !baseTokenBalance ||
        !compareAsBN(baseTokenBalance, totalPriceToDisplay)
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
    c2dPrice,
    totalPriceToDisplay
  ])
  useEffect(() => {
    const allVerified =
      verificationQueue.length > 0 &&
      verificationQueue.every((item) => item.status === 'verified')

    setFieldValue('credentialsVerified', allVerified, false)
    validateForm()
  }, [verificationQueue, setFieldValue, validateForm])

  useEffect(() => {
    if (!totalPrices || totalPrices.length === 0) {
      return
    }

    const sumTotalPrices = totalPrices.reduce((acc, item) => {
      return acc.add(new Decimal(item.value || 0))
    }, new Decimal(0))

    const finalTotal = sumTotalPrices
      .add(
        datasetProviderFees[0]?.value
          ? new Decimal(datasetProviderFees[0].value)
          : new Decimal(0)
      )
      .add(
        algorithmProviderFees[0]?.value
          ? new Decimal(algorithmProviderFees[0].value)
          : new Decimal(0)
      )
      .add(datasetOecFees)
      .add(algoOecFee)
      .toDecimalPlaces(MAX_DECIMALS)

    setTotalPriceToDisplay(finalTotal.toDecimalPlaces(MAX_DECIMALS).toString())
  }, [
    totalPrices,
    accessDetails?.price,
    algoOrderPrice,
    selectedAlgorithmAsset,
    serviceIndex,
    datasetProviderFees,
    algorithmProviderFees
  ])
  useEffect(() => {
    if (datasetProviderFeeProp) setDatasetProviderFee(datasetProviderFeeProp)
  }, [datasetProviderFeeProp])

  useEffect(() => {
    if (algorithmProviderFeeProp)
      setAlgorithmProviderFee(algorithmProviderFeeProp)
  }, [algorithmProviderFeeProp])

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>
      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          <div className={styles.assetSection}>
            <h3 className={styles.assetHeading}>Assets</h3>

            <div className={styles.assetList}>
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
                      label={item?.asset?.credentialSubject?.metadata?.name}
                      itemName={item.name}
                      value={item.price}
                      duration={item.duration}
                      actionLabel={
                        item.status === 'unverified'
                          ? 'Check Credentials'
                          : item.status === 'checking'
                          ? 'Verifying...'
                          : item.status === 'failed'
                          ? 'Retry'
                          : item.status === 'expired'
                          ? 'Check Credentials'
                          : 'Verified'
                      }
                      onAction={() => startVerification(i)}
                      actionDisabled={
                        item.status === 'checking' || item.status === 'verified'
                      }
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
                      symbol={symbol}
                    />
                  )
                })
              )}
            </div>
          </div>

          <div className={styles.c2dSection}>
            <h3 className={styles.c2dHeading}>C2D Resources</h3>

            <div className={styles.c2dList}>
              {computeItems.map((item) => (
                <PricingRow
                  key={item.name}
                  itemName={item.name}
                  value={item.value}
                  duration={item.duration}
                  symbol={symbol}
                />
              ))}

              {escrowFunds.map((item) => (
                <PricingRow
                  key={item.name}
                  itemName={item.name}
                  value={item.value}
                  valueType="escrow"
                  symbol={symbol}
                />
              ))}

              {amountDeposit.map((item) => (
                <PricingRow
                  key={item.name}
                  itemName={item.name}
                  value={item.value}
                  valueType="deposit"
                  symbol={symbol}
                />
              ))}
            </div>
          </div>

          <div className={styles.marketFeesSection}>
            <h3 className={styles.marketFeesHeading}>Fees</h3>

            <div className={styles.marketFeesList}>
              {marketFees.map((fee) => (
                <PricingRow
                  key={fee.name}
                  itemName={fee.name}
                  value={fee.value}
                  symbol={symbol}
                />
              ))}

              {datasetProviderFee
                ? datasetProviderFees.map((fee) => (
                    <PricingRow
                      key={fee.name}
                      itemName={fee.name}
                      value={fee.value}
                      symbol={symbol}
                    />
                  ))
                : null}

              {algorithmProviderFee
                ? algorithmProviderFees.map((fee) => (
                    <PricingRow
                      key={fee.name}
                      itemName={fee.name}
                      value={fee.value}
                      symbol={symbol}
                    />
                  ))
                : null}
            </div>
          </div>
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
              actions={[`${privacyPolicySlug}#terms-and-conditions`]}
              disabled={false}
              hideLabel={true}
            />

            <Field
              component={Input}
              name="acceptPublishingLicense"
              type="checkbox"
              options={[
                'license terms under which each of the selected assets was made available'
              ]}
              prefixes={['I agree to the']}
              disabled={false}
              hideLabel={true}
            />
          </FormErrorGroup>
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
