'use client'

import { ReactElement, useEffect, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import Input from '@shared/FormInput'
import FormErrorGroup from '@shared/FormInput/CheckboxGroupWithErrors'
import Loader from '@components/@shared/atoms/Loader'
import { AssetActionCheckCredentials } from '@components/Asset/AssetActions/CheckCredentials'
import { AssetActionCheckCredentialsAlgo } from '@components/Asset/AssetActions/CheckCredentials/checkCredentialsAlgo'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import { useAccount } from 'wagmi'
import useBalance from '@hooks/useBalance'
import { useSsiWallet } from '@context/SsiWallet'
import { useCancelToken } from '@hooks/useCancelToken'
import { useAsset } from '@context/Asset'
import { useUserPreferences } from '@context/UserPreferences'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { getFixedBuyPrice } from '@utils/ocean/fixedRateExchange'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo, getTokenBalanceFromSymbol } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { requiresSsi } from '@utils/credentials'
import { getFeeTooltip } from '@utils/feeTooltips'
import { getAsset } from '@utils/aquarius'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { ResourceType } from 'src/@types/ResourceType'
import { Asset } from 'src/@types/Asset'
import { Signer, formatUnits } from 'ethers'
import Decimal from 'decimal.js'
import { consumeMarketOrderFee } from 'app.config.cjs'
import { MAX_DECIMALS } from '@utils/constants'
import PricingRow from './PricingRow'
import styles from './index.module.css'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeFlow, FormComputeData } from '../_types'

type VerificationStatus =
  | 'verified'
  | 'checking'
  | 'failed'
  | 'expired'
  | 'unverified'

interface VerificationItem {
  id: string
  type: 'dataset' | 'algorithm'
  asset: AssetExtended
  service: Service
  status: VerificationStatus
  index: number
  price: string
  duration: string
  name: string
}

type TotalPriceEntry = { value: string; symbol: string }

type ReviewProps = {
  flow: ComputeFlow
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  computeEnvs: ComputeEnvironment[]
  isConsumable: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtBalance: string
  isAccountIdWhitelisted: boolean
  datasetSymbol?: string
  algorithmSymbol?: string
  providerFeesSymbol?: string
  assetTimeout?: string
  totalPrices?: TotalPriceEntry[]
  datasetOrderPrice?: string
  algoOrderPrice?: string
  datasetOrderPriceAndFees?: OrderPriceAndFees
  algoOrderPriceAndFees?: OrderPriceAndFees
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient: boolean
  setIsBalanceSufficient: React.Dispatch<React.SetStateAction<boolean>>
  allResourceValues: {
    [envId: string]: ResourceType
  }
  setAllResourceValues: React.Dispatch<
    React.SetStateAction<{
      [envId: string]: ResourceType
    }>
  >
  isRequestingPrice?: boolean
  signer?: Signer
  algorithms?: AssetSelectionAsset[]
  ddoListAlgorithms?: Asset[]
  selectedAlgorithmAsset?: AssetExtended
  setSelectedAlgorithmAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended>
  >
  isLoading?: boolean
  isComputeButtonDisabled?: boolean
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  dtSymbolSelectedComputeAsset?: string
  dtBalanceSelectedComputeAsset?: string
  selectedComputeAssetType?: string
  selectedComputeAssetTimeout?: string
  stepText?: string
  consumableFeedback?: string
  retry?: boolean
  datasets?: AssetSelectionAsset[]
  selectedDatasetAsset?: AssetExtended[]
  setSelectedDatasetAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended[]>
  >
  tokenInfo?: TokenInfo
}

export default function Review({
  flow,
  asset,
  service,
  accessDetails,
  computeEnvs,
  hasPreviousOrder,
  hasDatatoken,
  dtBalance,
  isAccountIdWhitelisted,
  datasetSymbol,
  algorithmSymbol,
  providerFeesSymbol,
  algoOrderPriceAndFees,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient,
  allResourceValues,
  setAllResourceValues,
  isRequestingPrice = false,
  signer,
  algorithms,
  ddoListAlgorithms = [],
  selectedAlgorithmAsset,
  setSelectedAlgorithmAsset,
  datasets,
  selectedDatasetAsset,
  setSelectedDatasetAsset,
  tokenInfo
}: ReviewProps): ReactElement {
  const isDatasetFlow = flow === 'dataset'
  const { address: accountId } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isAssetNetwork } = useAsset()
  const { privacyPolicySlug } = useUserPreferences()

  const [symbol, setSymbol] = useState('')
  const [tokenInfoState, setTokenInfoState] = useState<TokenInfo | undefined>(
    tokenInfo
  )
  const [algoOecFee, setAlgoOecFee] = useState<string>('0')
  const [datasetOecFees, setDatasetOecFees] = useState<string>('0')
  const { setFieldValue, values, validateForm } =
    useFormikContext<FormComputeData>()
  const [verificationQueue, setVerificationQueue] = useState<
    VerificationItem[]
  >([])
  const [currentVerificationIndex, setCurrentVerificationIndex] =
    useState<number>(-1)
  const [showCredentialsCheck, setShowCredentialsCheck] =
    useState<boolean>(false)
  const [serviceIndex, setServiceIndex] = useState(0)
  const [datasetProviderFee, setDatasetProviderFee] = useState(
    datasetProviderFeeProp || null
  )
  const [algorithmProviderFee, setAlgorithmProviderFee] = useState(
    algorithmProviderFeeProp || null
  )
  const [algoOrderPriceValue, setAlgoOrderPriceValue] = useState<string>()
  const [totalPrices, setTotalPrices] = useState<TotalPriceEntry[]>([])
  const [totalPriceToDisplay, setTotalPriceToDisplay] = useState<string>('0')
  const [algoLoadError, setAlgoLoadError] = useState<string>()

  const selectedEnvId =
    typeof values?.computeEnv === 'string'
      ? values?.computeEnv
      : values?.computeEnv?.id
  const freeResources = allResourceValues?.[`${selectedEnvId}_free`]
  const paidResources = allResourceValues?.[`${selectedEnvId}_paid`]
  const currentMode = values?.mode || 'free'
  const c2dPriceRaw =
    currentMode === 'paid' ? paidResources?.price : freeResources?.price
  const c2dPrice =
    c2dPriceRaw != null ? Math.round(Number(c2dPriceRaw) * 100) / 100 : 0

  const errorMessages: string[] = []
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
    const effectiveProvider = signer?.provider
    const effectiveChainId = asset?.credentialSubject?.chainId
    if (!effectiveProvider || !effectiveChainId) return
    const fetchTokenDetails = async () => {
      const { oceanTokenAddress } = getOceanConfig(effectiveChainId)
      const tokenDetails = await getTokenInfo(
        oceanTokenAddress,
        effectiveProvider
      )
      setTokenInfoState(tokenDetails)
      setSymbol(tokenDetails.symbol || 'OCEAN')
    }
    fetchTokenDetails()
  }, [signer, isDatasetFlow, asset?.credentialSubject?.chainId])

  useEffect(() => {
    async function fetchPricesDatasetFlow() {
      if (
        isDatasetFlow &&
        asset &&
        asset.credentialSubject?.chainId &&
        accessDetails &&
        signer &&
        !accessDetails.isOwned
      ) {
        try {
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
        isDatasetFlow &&
        selectedAlgorithmAsset &&
        selectedAlgorithmAsset.accessDetails?.[serviceIndex] &&
        !selectedAlgorithmAsset.accessDetails[serviceIndex].isOwned &&
        signer
      ) {
        try {
          const algoFixed = await getFixedBuyPrice(
            selectedAlgorithmAsset.accessDetails[serviceIndex],
            selectedAlgorithmAsset.credentialSubject?.chainId,
            signer
          )
          setAlgoOecFee(algoFixed?.oceanFeeAmount || '0')
        } catch (e) {
          console.error('Could not fetch algo fixed buy price:', e)
        }
      }
    }

    async function fetchPricesAlgorithmFlow() {
      if (!isDatasetFlow && selectedDatasetAsset?.length) {
        try {
          const feeSum = (
            await Promise.all(
              selectedDatasetAsset.map(async (dataset) => {
                const details =
                  dataset.accessDetails?.[dataset.serviceIndex || 0]
                if (details && dataset.credentialSubject?.chainId && signer) {
                  if (details.isOwned) return 0
                  const fixed = await getFixedBuyPrice(
                    details,
                    dataset.credentialSubject.chainId,
                    signer
                  )
                  return Number(fixed?.oceanFeeAmount) || 0
                }
                return 0
              })
            )
          ).reduce((acc, curr) => acc + curr, 0)
          setDatasetOecFees(feeSum.toString())
        } catch (e) {
          console.error('Could not fetch dataset fixed buy price sum:', e)
        }
      }

      if (
        !isDatasetFlow &&
        asset &&
        accessDetails &&
        signer &&
        !accessDetails.isOwned
      ) {
        try {
          const algoFixed = await getFixedBuyPrice(
            accessDetails,
            asset.credentialSubject?.chainId,
            signer
          )
          setAlgoOecFee(algoFixed?.oceanFeeAmount || '0')
        } catch (e) {
          console.error('Could not fetch algorithm fixed buy price:', e)
        }
      }
    }

    fetchPricesDatasetFlow()
    fetchPricesAlgorithmFlow()
  }, [
    isDatasetFlow,
    asset,
    accessDetails,
    signer,
    selectedAlgorithmAsset,
    selectedDatasetAsset,
    serviceIndex
  ])

  useEffect(() => {
    if (algoOrderPriceAndFees?.price) {
      setAlgoOrderPriceValue(algoOrderPriceAndFees.price)
    } else if (accessDetails?.price) {
      setAlgoOrderPriceValue(accessDetails.price)
    }
  }, [algoOrderPriceAndFees?.price, accessDetails?.price])

  useEffect(() => {
    if (computeEnvs?.length === 1 && !values.computeEnv) {
      setFieldValue('computeEnv', computeEnvs[0], true)
    }
    if (
      isDatasetFlow &&
      algorithms?.length === 1 &&
      !values.algorithm &&
      algorithms?.[0]?.isAccountIdWhitelisted
    ) {
      const { did } = algorithms[0]
      setFieldValue('algorithm', did, true)
    }
    if (
      !isDatasetFlow &&
      datasets?.length === 1 &&
      !values.dataset &&
      datasets?.[0]?.isAccountIdWhitelisted
    ) {
      const { did } = datasets[0]
      setFieldValue('dataset', did, true)
    }
  }, [
    computeEnvs,
    values.computeEnv,
    values.algorithm,
    values.dataset,
    algorithms,
    datasets,
    isDatasetFlow,
    setFieldValue
  ])

  useEffect(() => {
    if (!values.computeEnv || !computeEnvs) return
    const envId =
      typeof values.computeEnv === 'string'
        ? (values.computeEnv as unknown as string)
        : values.computeEnv?.id
    const selectedEnv = computeEnvs.find((env) => env.id === envId)
    if (!selectedEnv) return
    if (
      !allResourceValues[`${selectedEnv.id}_free`] &&
      !allResourceValues[`${selectedEnv.id}_paid`]
    ) {
      const cpu = selectedEnv.resources.find((r) => r.id === 'cpu')?.min || 1
      const ram =
        selectedEnv.resources.find((r) => r.id === ('ram' as string))?.min ||
        1_000_000_000
      const disk =
        selectedEnv.resources.find((r) => r.id === ('disk' as string))?.min ||
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
  }, [values.computeEnv, computeEnvs, allResourceValues, setAllResourceValues])

  async function getDatasetAssets(datasetsIds: string[]): Promise<{
    assets: AssetExtended[]
    services: Service[]
  }> {
    if (!Array.isArray(datasetsIds) || datasetsIds.length === 0) {
      return { assets: [], services: [] }
    }
    const newCancelTokenInstance = newCancelToken()
    const servicesCollected: Service[] = []
    const assets = await Promise.all(
      datasetsIds.map(async (item) => {
        const [datasetId, serviceId] = item.split('|')
        try {
          const fetched = await getAsset(datasetId, newCancelTokenInstance)
          if (!fetched || !fetched.credentialSubject?.services?.length)
            return null
          const serviceIndex = fetched.credentialSubject.services.findIndex(
            (svc) => svc.id === serviceId
          )
          const accessDetailsList = await Promise.all(
            fetched.credentialSubject.services.map((svc) =>
              getAccessDetails(
                fetched.credentialSubject.chainId,
                svc,
                accountId,
                newCancelTokenInstance
              )
            )
          )
          const extended: AssetExtended = {
            ...fetched,
            accessDetails: accessDetailsList,
            serviceIndex: serviceIndex !== -1 ? serviceIndex : null
          }
          if (serviceIndex !== -1) {
            servicesCollected.push(
              fetched.credentialSubject.services[serviceIndex]
            )
          }
          return extended
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

  useEffect(() => {
    if (isDatasetFlow) return
    if (values.withoutDataset || !values.dataset) return
    async function fetchDatasetAssetsExtended() {
      const { assets } = await getDatasetAssets(values.dataset as string[])
      setSelectedDatasetAsset && setSelectedDatasetAsset(assets)
    }
    fetchDatasetAssetsExtended()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.dataset, values.withoutDataset, isDatasetFlow])

  useEffect(() => {
    const queue: VerificationItem[] = []
    if (isDatasetFlow) {
      if (asset && service) {
        const sessionId = lookupVerifierSessionId?.(asset.id, service.id)
        const isVerified = Boolean(sessionId)
        const rawPrice =
          accessDetails?.validOrderTx && accessDetails.validOrderTx !== ''
            ? '0'
            : accessDetails.price
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

      const algoServices: Service[] | undefined =
        (selectedAlgorithmAsset as AssetExtended | undefined)?.credentialSubject
          ?.services ||
        ((selectedAlgorithmAsset as unknown as { services?: Service[] })
          ?.services ??
          undefined)
      const algoService = algoServices?.[serviceIndex] || algoServices?.[0]
      if (selectedAlgorithmAsset && algoService) {
        const sessionId = lookupVerifierSessionId?.(
          selectedAlgorithmAsset.id,
          algoService?.id
        )
        const isVerified = Boolean(sessionId)
        const details = selectedAlgorithmAsset?.accessDetails?.[serviceIndex]
        const rawPrice =
          details?.validOrderTx || details?.price
            ? details?.validOrderTx
              ? '0'
              : details?.price || '0'
            : algoService?.price || '0'
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
    } else {
      if (!values.withoutDataset) {
        selectedDatasetAsset?.forEach((ds, index) => {
          const dsService =
            ds.credentialSubject?.services?.[ds.serviceIndex || 0]
          const sessionId = lookupVerifierSessionId?.(ds.id, dsService?.id)
          const isVerified = Boolean(sessionId)
          const details = ds.accessDetails?.[ds.serviceIndex || 0]
          const rawPrice =
            details?.validOrderTx && details.validOrderTx !== ''
              ? '0'
              : details?.price || '0'
          queue.push({
            id: ds.id,
            type: 'dataset',
            asset: ds,
            service: dsService,
            status: isVerified
              ? ('verified' as const)
              : ('unverified' as const),
            index,
            price: rawPrice,
            duration: '1 day',
            name:
              ds.credentialSubject?.services?.[ds.serviceIndex || 0]?.name ||
              `Dataset ${queue.length + 1}`
          })
        })
      }
      if (service && asset) {
        const sessionId = lookupVerifierSessionId?.(asset?.id, service.id)
        const isVerified = Boolean(sessionId)
        const rawPrice = asset.credentialSubject.metadata.algorithm
          ? accessDetails?.validOrderTx
            ? '0'
            : accessDetails.price
          : asset.accessDetails?.[0].validOrderTx
          ? '0'
          : asset.accessDetails?.[0].price
        queue.push({
          id: asset.id,
          type: 'algorithm',
          asset,
          service,
          status: isVerified ? ('verified' as const) : ('unverified' as const),
          index: queue.length,
          price: rawPrice,
          duration: formatDuration(service.timeout || 0),
          name: service.name
        })
      }
    }
    setVerificationQueue(queue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDatasetFlow,
    asset,
    service,
    accessDetails,
    selectedAlgorithmAsset,
    selectedDatasetAsset,
    values.withoutDataset,
    serviceIndex
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
              const isExpired = now - timestamp > 5 * 60 * 1000
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

  useEffect(() => {
    if (isDatasetFlow) {
      if (
        !asset?.accessDetails ||
        !selectedAlgorithmAsset?.accessDetails?.length
      )
        return
      const details = selectedAlgorithmAsset.accessDetails[serviceIndex]
      const datasetPrice =
        accessDetails?.validOrderTx && accessDetails.validOrderTx !== ''
          ? '0'
          : accessDetails?.price || '0'
      setDatasetProviderFee(datasetProviderFeeProp || datasetProviderFee)
      const algoPrice =
        details?.validOrderTx || hasPreviousOrder || hasDatatoken
          ? '0'
          : details?.price || '0'
      const priceDatasetDecimal = new Decimal(
        datasetPrice || 0
      ).toDecimalPlaces(MAX_DECIMALS)
      const priceAlgoDecimal = new Decimal(algoPrice || 0).toDecimalPlaces(
        MAX_DECIMALS
      )
      const priceC2D = new Decimal(c2dPrice || 0).toDecimalPlaces(MAX_DECIMALS)
      const feeAlgo = details?.isOwned
        ? new Decimal(0)
        : new Decimal(
            formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
          )
      const feeDataset = accessDetails?.isOwned
        ? new Decimal(0)
        : new Decimal(
            formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
          )

      const totalPricesLocal: TotalPriceEntry[] = []
      if (algorithmSymbol === providerFeesSymbol) {
        let sum = priceC2D.add(priceAlgoDecimal).add(feeAlgo)
        totalPricesLocal.push({
          value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: algorithmSymbol
        })
        if (algorithmSymbol === datasetSymbol) {
          sum = sum.add(priceDatasetDecimal).add(feeDataset)
          totalPricesLocal[0].value = sum
            .toDecimalPlaces(MAX_DECIMALS)
            .toString()
        } else {
          totalPricesLocal.push({
            value: priceDatasetDecimal
              .add(feeDataset)
              .toDecimalPlaces(MAX_DECIMALS)
              .toString(),
            symbol: datasetSymbol
          })
        }
      } else {
        if (datasetSymbol === providerFeesSymbol) {
          const sum = priceC2D.add(priceDatasetDecimal).add(feeDataset)
          totalPricesLocal.push({
            value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
            symbol: datasetSymbol
          })
          totalPricesLocal.push({
            value: priceAlgoDecimal
              .add(feeAlgo)
              .toDecimalPlaces(MAX_DECIMALS)
              .toString(),
            symbol: algorithmSymbol
          })
        } else if (datasetSymbol === algorithmSymbol) {
          const sum = priceAlgoDecimal
            .add(priceDatasetDecimal)
            .add(feeAlgo)
            .add(feeDataset)
          totalPricesLocal.push({
            value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
            symbol: algorithmSymbol
          })
          totalPricesLocal.push({
            value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
            symbol: providerFeesSymbol
          })
        } else {
          totalPricesLocal.push({
            value: priceDatasetDecimal
              .add(feeDataset)
              .toDecimalPlaces(MAX_DECIMALS)
              .toString(),
            symbol: datasetSymbol
          })
          totalPricesLocal.push({
            value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
            symbol: providerFeesSymbol
          })
          totalPricesLocal.push({
            value: priceAlgoDecimal
              .add(feeAlgo)
              .toDecimalPlaces(MAX_DECIMALS)
              .toString(),
            symbol: algorithmSymbol
          })
        }
      }
      setTotalPrices(totalPricesLocal)
      return
    }

    if (!asset?.accessDetails) return
    const rawAlgoPrice =
      hasPreviousOrder || hasDatatoken
        ? '0'
        : algoOrderPriceValue || accessDetails?.price || '0'
    const priceAlgo = new Decimal(rawAlgoPrice || 0).toDecimalPlaces(
      MAX_DECIMALS
    )
    const feeAlgo = accessDetails.isOwned
      ? new Decimal(0)
      : new Decimal(
          formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
        )
    let priceDataset = new Decimal(0)
    let feeDataset = new Decimal(0)
    if (Array.isArray(selectedDatasetAsset)) {
      selectedDatasetAsset.forEach((dataset) => {
        const index = dataset.serviceIndex || 0
        const details = dataset.accessDetails?.[index]
        const rawPrice = details?.validOrderTx ? '0' : details?.price || '0'
        const price = new Decimal(rawPrice).toDecimalPlaces(MAX_DECIMALS)
        const fee = details?.isOwned
          ? new Decimal(0)
          : new Decimal(
              formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
            )
        priceDataset = priceDataset.add(price)
        feeDataset = feeDataset.add(fee)
      })
    }
    const priceC2D = new Decimal(c2dPrice || 0).toDecimalPlaces(MAX_DECIMALS)
    const totalPricesLocal: TotalPriceEntry[] = []
    if (algorithmSymbol === providerFeesSymbol) {
      let sum = priceC2D.add(priceAlgo).add(feeAlgo)
      totalPricesLocal.push({
        value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
        symbol: algorithmSymbol
      })
      if (algorithmSymbol === datasetSymbol) {
        sum = sum.add(priceDataset).add(feeDataset)
        totalPricesLocal[0].value = sum.toDecimalPlaces(MAX_DECIMALS).toString()
      } else {
        totalPricesLocal.push({
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
        totalPricesLocal.push({
          value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: datasetSymbol
        })
        totalPricesLocal.push({
          value: priceAlgo
            .add(feeAlgo)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: algorithmSymbol
        })
      } else if (datasetSymbol === algorithmSymbol) {
        const sum = priceAlgo.add(priceDataset).add(feeAlgo).add(feeDataset)
        totalPricesLocal.push({
          value: sum.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: algorithmSymbol
        })
        totalPricesLocal.push({
          value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: providerFeesSymbol
        })
      } else {
        totalPricesLocal.push({
          value: priceDataset
            .add(feeDataset)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: datasetSymbol
        })
        totalPricesLocal.push({
          value: priceC2D.toDecimalPlaces(MAX_DECIMALS).toString(),
          symbol: providerFeesSymbol
        })
        totalPricesLocal.push({
          value: priceAlgo
            .add(feeAlgo)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
          symbol: algorithmSymbol
        })
      }
    }
    setTotalPrices(totalPricesLocal)
  }, [
    isDatasetFlow,
    asset,
    accessDetails,
    selectedAlgorithmAsset,
    selectedDatasetAsset,
    serviceIndex,
    hasPreviousOrder,
    hasDatatoken,
    algoOrderPriceAndFees?.price,
    algoOrderPriceValue,
    datasetProviderFeeProp,
    datasetProviderFee,
    algorithmSymbol,
    datasetSymbol,
    providerFeesSymbol,
    c2dPrice,
    tokenInfoState?.decimals
  ])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (datasetProviderFeeProp) setDatasetProviderFee(datasetProviderFeeProp)
  }, [datasetProviderFeeProp])

  useEffect(() => {
    if (algorithmProviderFeeProp)
      setAlgorithmProviderFee(algorithmProviderFeeProp)
  }, [algorithmProviderFeeProp])

  useEffect(() => {
    const priceChecks = [...totalPrices]
    if (
      c2dPrice &&
      !totalPrices.some(
        (p) =>
          p.symbol === providerFeesSymbol && p.value === c2dPrice.toString()
      )
    ) {
      priceChecks.push({
        value: c2dPrice.toString(),
        symbol: providerFeesSymbol
      })
    }
    const filteredPriceChecks = priceChecks.filter(
      (price) => price.value !== '0'
    )
    let sufficient = true
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
    totalPriceToDisplay,
    setIsBalanceSufficient
  ])

  useEffect(() => {
    const allVerified =
      verificationQueue.length > 0 &&
      verificationQueue.every((item) => item.status === 'verified')
    setFieldValue('credentialsVerified', allVerified, false)
    validateForm()
  }, [verificationQueue, setFieldValue, validateForm])

  useEffect(() => {
    const sumTotalPrices = totalPrices.reduce((acc, item) => {
      return acc.add(new Decimal(item.value || 0))
    }, new Decimal(0))

    const finalTotal = sumTotalPrices
      .add(
        datasetProviderFee
          ? new Decimal(
              formatUnits(datasetProviderFee, tokenInfoState?.decimals)
            )
          : new Decimal(0)
      )
      .add(
        algorithmProviderFee
          ? new Decimal(
              formatUnits(algorithmProviderFee, tokenInfoState?.decimals)
            )
          : new Decimal(0)
      )
      .add(new Decimal(datasetOecFees || 0))
      .add(new Decimal(algoOecFee || 0))
      .toDecimalPlaces(MAX_DECIMALS)

    setTotalPriceToDisplay(finalTotal.toDecimalPlaces(MAX_DECIMALS).toString())
  }, [
    totalPrices,
    accessDetails?.price,
    selectedAlgorithmAsset,
    serviceIndex,
    datasetProviderFee,
    algorithmProviderFee,
    datasetOecFees,
    algoOecFee,
    tokenInfoState?.decimals
  ])

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

  const datasetProviderFeesList = [
    {
      name: 'PROVIDER FEE DATASET',
      value: datasetProviderFee
        ? formatUnits(datasetProviderFee, tokenInfoState?.decimals)
        : '0'
    }
  ]
  const algorithmProviderFeesList = [
    {
      name: 'PROVIDER FEE ALGORITHM',
      value: algorithmProviderFee
        ? formatUnits(algorithmProviderFee, tokenInfoState?.decimals)
        : '0'
    }
  ]

  const datasetMarketFeeValue = (() => {
    const feePerDataset = new Decimal(
      formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
    )
    const chargeableDatasets =
      selectedDatasetAsset?.filter((ds) => {
        const idx = ds.serviceIndex || 0
        return !ds.accessDetails?.[idx]?.isOwned
      }).length || 0
    return feePerDataset
      .mul(chargeableDatasets)
      .toDecimalPlaces(MAX_DECIMALS)
      .toString()
  })()

  const marketFeesBase = isDatasetFlow
    ? [
        {
          name: `MARKETPLACE ORDER FEE DATASET`,
          value: accessDetails?.isOwned
            ? '0'
            : new Decimal(
                formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
              ).toString()
        },
        {
          name: `MARKETPLACE ORDER FEE ALGORITHM`,
          value: (() => {
            const algoAccessDetails =
              selectedAlgorithmAsset?.accessDetails?.[serviceIndex]
            const isOwned = algoAccessDetails?.isOwned
            const feeValue = isOwned
              ? '0'
              : new Decimal(
                  formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
                ).toString()
            return feeValue
          })()
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
    : [
        {
          name: `MARKETPLACE ORDER FEE DATASET`,
          value: datasetMarketFeeValue
        },
        {
          name: `MARKETPLACE ORDER FEE ALGORITHM`,
          value: (() => {
            const isOwned = accessDetails?.isOwned
            const feeValue = isOwned
              ? '0'
              : new Decimal(
                  formatUnits(consumeMarketOrderFee, tokenInfoState?.decimals)
                ).toString()
            return feeValue
          })()
        },
        {
          name: `OEC FEE DATASET`,
          value: datasetOecFees.toString()
        },
        {
          name: `OEC FEE ALGORITHM`,
          value: algoOecFee.toString()
        }
      ]

  const marketFees =
    !isDatasetFlow && values.withoutDataset
      ? marketFeesBase.filter((fee) => !fee.name.includes('DATASET'))
      : marketFeesBase

  if (!isBalanceSufficient) {
    errorMessages.push(`You don't have enough ${symbol} to make this purchase.`)
  }
  if (!isAssetNetwork) {
    errorMessages.push('This asset is not available on the selected network.')
  }
  if (
    !isDatasetFlow &&
    selectedDatasetAsset?.length &&
    selectedDatasetAsset.some(
      (d) =>
        d.accessDetails &&
        d.accessDetails[d.serviceIndex || 0] &&
        !d.accessDetails[d.serviceIndex || 0].isPurchasable
    )
  ) {
    errorMessages.push('One or more selected datasets are not purchasable.')
  }
  if (
    selectedAlgorithmAsset?.accessDetails &&
    selectedAlgorithmAsset.accessDetails[serviceIndex] &&
    !selectedAlgorithmAsset.accessDetails[serviceIndex].isPurchasable
  ) {
    errorMessages.push('The selected algorithm asset is not purchasable.')
  }
  if (!isAccountIdWhitelisted) {
    errorMessages.push(
      'Your account is not whitelisted to purchase this asset.'
    )
  }

  const currentVerificationItem = verificationQueue[currentVerificationIndex]
  const assetRows = verificationQueue
  const isLoadingAssets = isDatasetFlow
    ? !selectedAlgorithmAsset
    : !values.withoutDataset &&
      (!selectedDatasetAsset || selectedDatasetAsset.length === 0)

  function getAlgorithmAsset(algo: string): {
    algorithmAsset: AssetExtended | null
    serviceIndexAlgo: number | null
  } {
    let algorithmId = algo
    let serviceId = ''
    try {
      const parsed = JSON.parse(algo)
      algorithmId = parsed?.algoDid || algo
      serviceId = parsed?.serviceId || ''
    } catch {
      algorithmId = algo
    }

    let algorithmAsset: AssetExtended | null = null
    let serviceIndexAlgo: number | null = null

    ddoListAlgorithms?.forEach((ddo: Asset) => {
      if (ddo.id === algorithmId) {
        algorithmAsset = ddo as AssetExtended
        if (serviceId && ddo.credentialSubject?.services) {
          const idx = ddo.credentialSubject.services.findIndex(
            (svc: Service) => svc.id === serviceId
          )
          serviceIndexAlgo = idx !== -1 ? idx : null
        }
      }
    })

    return { algorithmAsset, serviceIndexAlgo }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isDatasetFlow) return
    if (selectedAlgorithmAsset) return

    const algoId = values.algorithm as string | undefined
    const fallbackAlgo = values.algorithms as AssetExtended | undefined

    if (!algoId && fallbackAlgo) {
      if (fallbackAlgo.serviceIndex !== undefined) {
        setServiceIndex(fallbackAlgo.serviceIndex)
      }
      setSelectedAlgorithmAsset?.(fallbackAlgo)
      setAlgoLoadError(undefined)
      return
    }

    if (!algoId) {
      setAlgoLoadError('Algorithm selection missing for review.')
      return
    }

    const { algorithmAsset, serviceIndexAlgo } = getAlgorithmAsset(algoId)
    if (!algorithmAsset) {
      setAlgoLoadError('Algorithm asset not found for review.')
      return
    }

    async function fetchAlgorithmAssetExtended() {
      try {
        const algoAccessDetails = await Promise.all(
          algorithmAsset.credentialSubject?.services?.map((svc: Service) =>
            getAccessDetails(
              algorithmAsset.credentialSubject?.chainId,
              svc,
              accountId,
              newCancelToken()
            )
          ) || []
        )

        if (serviceIndexAlgo !== null) {
          setServiceIndex(serviceIndexAlgo)
        }

        const extendedAlgo: AssetExtended = {
          ...algorithmAsset,
          accessDetails: algoAccessDetails,
          serviceIndex: serviceIndexAlgo ?? undefined
        }
        setSelectedAlgorithmAsset?.(extendedAlgo)
        setAlgoLoadError(undefined)
      } catch (e) {
        console.error('Could not fetch algorithm asset in review:', e)
      }
    }
    fetchAlgorithmAssetExtended()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDatasetFlow,
    selectedAlgorithmAsset,
    values.algorithm,
    values.algorithms,
    ddoListAlgorithms,
    accountId,
    newCancelToken,
    setSelectedAlgorithmAsset
  ])

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          <div className={styles.assetSection}>
            <h3 className={styles.assetHeading}>Assets</h3>
            <div className={styles.assetListBox}>
              {algoLoadError ? (
                <div className={styles.loaderWrap}>
                  <div className={styles.errorMessage}>{algoLoadError}</div>
                </div>
              ) : isLoadingAssets ? (
                <div className={styles.loaderWrap}>
                  <Loader message="Loading assets..." noMargin />
                </div>
              ) : (
                assetRows.map((item, i) => {
                  const hasSsiPolicy =
                    requiresSsi(item.asset?.credentialSubject?.credentials) ||
                    requiresSsi(item.service?.credentials)
                  return (
                    <PricingRow
                      key={`${item.type}-${item.id}-${i}`}
                      label={item.asset?.credentialSubject?.metadata?.name}
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
                      symbol={symbol}
                      tooltip={getFeeTooltip(item.name)}
                      showStatusWithoutAction
                    />
                  )
                })
              )}
            </div>
          </div>

          <div className={styles.c2dSection}>
            <h3 className={styles.c2dHeading}>C2D Resources</h3>
            <div className={styles.c2dBox}>
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
            <div className={styles.marketFeesBox}>
              {marketFees.map((fee) => (
                <PricingRow
                  key={fee.name}
                  itemName={fee.name}
                  value={fee.value}
                  symbol={symbol}
                />
              ))}
              {!values.withoutDataset &&
                datasetProviderFee &&
                datasetProviderFeesList.map((fee) => (
                  <PricingRow
                    key={fee.name}
                    itemName={fee.name}
                    value={fee.value}
                    symbol={symbol}
                  />
                ))}
              {algorithmProviderFee &&
                algorithmProviderFeesList.map((fee) => (
                  <PricingRow
                    key={fee.name}
                    itemName={fee.name}
                    value={fee.value}
                    symbol={symbol}
                  />
                ))}
            </div>
          </div>
        </div>

        <div className={styles.totalSection}>
          <span className={styles.totalLabel}>YOU WILL PAY</span>
          <span className={styles.totalValue}>
            {isRequestingPrice ? (
              <span className={styles.totalValueNumber}>Calculating...</span>
            ) : totalPriceToDisplay !== '0' ? (
              <>
                <span className={styles.totalValueNumber}>
                  {totalPriceToDisplay}
                </span>
                <span className={styles.totalValueSymbol}>
                  {' '}
                  {totalPrices[0]?.symbol || symbol}
                </span>
              </>
            ) : (
              <>
                <span className={styles.totalValueNumber}>0</span>
                <span className={styles.totalValueSymbol}> {symbol}</span>
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
