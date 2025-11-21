/* eslint-disable react-hooks/exhaustive-deps */
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
import { useAccount, useNetwork, useSigner } from 'wagmi'
import useBalance from '@hooks/useBalance'
import { useSsiWallet } from '@context/SsiWallet'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import { consumeMarketOrderFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol, getTokenInfo } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import { CredentialDialogProvider } from '@components/Asset/AssetActions/Compute/CredentialDialogProvider'
import Loader from '@components/@shared/atoms/Loader'
import { requiresSsi } from '@utils/credentials'
import { useAsset } from '@context/Asset'
import { formatUnits } from 'ethers/lib/utils.js'
import { getOceanConfig } from '@utils/ocean'
import { getFixedBuyPrice } from '@utils/ocean/fixedRateExchange'
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
  setAllResourceValues,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient,
  tokenInfo
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
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient: boolean
  tokenInfo: TokenInfo
  setIsBalanceSufficient: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  const { address: accountId } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isAssetNetwork } = useAsset()

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

  const [serviceIndex, setServiceIndex] = useState(0)
  const [datasetProviderFee, setDatasetProviderFee] = useState(
    datasetProviderFeeProp || null
  )
  const [algorithmProviderFee, setAlgorithmProviderFee] = useState(
    algorithmProviderFeeProp || null
  )

  const [algoOpcFee, setAlgoOpcFee] = useState<string>('0')
  const [datasetOpcFees, setDatasetOpcFees] = useState<string>('0')

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

  const { data: signer } = useSigner()
  // error message
  const errorMessages: string[] = []
  const [symbol, setSymbol] = useState('')
  const { chain } = useNetwork()

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
          const algoFixed = await getFixedBuyPrice(
            accessDetails,
            asset.credentialSubject.chainId,
            signer
          )
          setAlgoOpcFee(algoFixed?.oceanFeeAmount || '0')
          // For algorithm
        } catch (e) {
          console.error('Could not fetch algorithm fixed buy price:', e)
        }
      }

      if (selectedDatasetAsset?.length) {
        try {
          const feeSum = (
            await Promise.all(
              selectedDatasetAsset.map(async (dataset) => {
                const details =
                  dataset.accessDetails?.[dataset.serviceIndex || 0]
                if (details && dataset.credentialSubject?.chainId && signer) {
                  if (details.isOwned) {
                    return 0
                  } else {
                    const fixed = await getFixedBuyPrice(
                      details,
                      dataset.credentialSubject.chainId,
                      signer
                    )
                    return Number(fixed?.oceanFeeAmount) || 0
                  }
                }
                return 0
              })
            )
          ).reduce((acc, curr) => acc + curr, 0)

          setDatasetOpcFees(feeSum.toString())
        } catch (e) {
          console.error('Could not fetch dataset fixed buy price sum:', e)
        }
      }
    }

    fetchPrices()
    // Add relevant dependencies, ensure signer and assets are set
  }, [asset, accessDetails, signer, selectedDatasetAsset])

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!chain?.id || !signer?.provider) return

      const { oceanTokenAddress } = getOceanConfig(chain.id)
      const tokenDetails = await getTokenInfo(
        oceanTokenAddress,
        signer.provider
      )
      setSymbol(tokenDetails.symbol || 'OCEAN')
    }

    fetchTokenDetails()
  }, [chain, signer])
  if (!isBalanceSufficient) {
    errorMessages.push(`You don't have enough ${symbol} to make this purchase.`)
  }
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
    if (!values.withoutDataset) {
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
          status: isVerified ? ('verified' as const) : ('unverified' as const),
          index,
          price: rawPrice,
          duration: '1 day', // Default duration for datasets
          name:
            asset.credentialSubject?.services?.[asset.serviceIndex || 0]
              ?.name || `Dataset ${queue.length + 1}`
        })
      })
    }
    if (service && asset) {
      const isVerified = lookupVerifierSessionId?.(asset?.id, service.id)
      let rawPrice
      if (asset.credentialSubject.metadata.algorithm) {
        rawPrice = accessDetails?.validOrderTx ? '0' : accessDetails.price
      } else {
        rawPrice = asset.accessDetails?.[0].validOrderTx
          ? '0'
          : asset.accessDetails?.[0].price
      }

      const algoNeedsSsi =
        requiresSsi(asset?.credentialSubject?.credentials) ||
        requiresSsi(service?.credentials)

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

    setVerificationQueue(queue)
  }, [selectedDatasetAsset, asset, service])

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
  // --- Calculate market fees for multiple datasets + one algorithm ---
  const totalDatasetMarketFeeConsume = selectedDatasetAsset
    ?.filter((dataset) => {
      const index = dataset.serviceIndex || 0
      return !dataset.accessDetails?.[index]?.isOwned
    })
    .reduce(
      (acc, dataset) =>
        acc.add(
          new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))
        ),
      new Decimal(0)
    )
    .toDecimalPlaces(MAX_DECIMALS)
  // Algorithm fee
  const algoFeeConsume = accessDetails.isOwned
    ? new Decimal(0)
    : new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))

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
      value: c2dPrice || '0'
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
      value: totalDatasetMarketFeeConsume
        .toDecimalPlaces(MAX_DECIMALS)
        .toString()
    },
    {
      name: `MARKETPLACE ORDER FEE ALGORITHM`,
      value: algoFeeConsume.toString()
    },
    {
      name: `MARKETPLACE OPC FEE DATASET`,
      value: datasetOpcFees.toString()
    },
    {
      name: `MARKETPLACE OPC FEE ALGORITHM`,
      value: algoOpcFee.toString()
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
    if (values.withoutDataset || !values.dataset || !isConsumable) return

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
      const fee = details?.isOwned
        ? new Decimal(0)
        : new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))

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

    const feeAlgo = accessDetails.isOwned
      ? new Decimal(0)
      : new Decimal(formatUnits(consumeMarketOrderFee, tokenInfo?.decimals))

    const priceC2D =
      c2dPrice !== undefined
        ? new Decimal(c2dPrice).toDecimalPlaces(MAX_DECIMALS)
        : new Decimal(0)
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
    values?.mode,
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
    try {
      // Sum all prices from totalPrices array (extract 'value')
      const totalPricesSum = totalPrices.reduce(
        (acc, val) => acc.add(new Decimal(val.value || 0)),
        new Decimal(0)
      )

      // Final combined total
      const displayTotal = totalPricesSum
        .add(
          algorithmProviderFees[0].value
            ? new Decimal(algorithmProviderFees[0].value)
            : new Decimal(0)
        )
        .add(
          datasetProviderFees[0].value
            ? new Decimal(datasetProviderFees[0].value)
            : new Decimal(0)
        )
        .add(datasetOpcFees)
        .add(algoOpcFee)
        .toDecimalPlaces(MAX_DECIMALS)

      setTotalPriceToDisplay(displayTotal.toString())
    } catch (error) {
      console.error('Error calculating totalPriceToDisplay:', error)
    }
  }, [totalPrices, marketFees, datasetProviderFees, algorithmProviderFees])

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
          <div className={styles.assetList}>
            <h3 className={styles.assetListHeading}>Assets</h3>

            <div className={styles.assetListBox}>
              {values.withoutDataset ? (
                verificationQueue.map((item, i) => {
                  const hasSsiPolicy =
                    requiresSsi(item.asset?.credentialSubject?.credentials) ||
                    requiresSsi(item.service?.credentials)
                  const needsSsi = hasSsiPolicy || item.service

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
                    />
                  )
                })
              ) : selectedDatasetAsset?.length === 0 ? (
                <div className={styles.loaderWrap}>
                  <Loader message="Loading Assets..." noMargin={true} />
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

              {datasetProviderFee &&
                datasetProviderFees.map((fee) => (
                  <PricingRow
                    key={fee.name}
                    itemName={fee.name}
                    value={fee.value}
                    symbol={symbol}
                  />
                ))}

              {algorithmProviderFee &&
                algorithmProviderFees.map((fee) => (
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
