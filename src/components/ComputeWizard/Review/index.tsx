import { ReactElement, useEffect, useState } from 'react'
import { useFormikContext, Field, FormikContextType } from 'formik'
import Input from '@shared/FormInput'
import StepTitle from '@shared/StepTitle'
import { FormComputeData } from '../_types'
import DatasetItem from './DatasetItem'
import ConnectedIcon from '@images/connected.svg'
import PriceDisplay from './PriceDisplay'
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
import { ComputeDatasetForm } from '../_constants'
import { useAccount } from 'wagmi'
import useBalance from '@hooks/useBalance'
import { useSsiWallet } from '@context/SsiWallet'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import Decimal from 'decimal.js'
import { MAX_DECIMALS } from '@utils/constants'
import appConfig, { consumeMarketOrderFee } from 'app.config.cjs'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { compareAsBN } from '@utils/numbers'
import type { Dataset } from '../SelectServices'
import ButtonBuy from '@components/Asset/AssetActions/ButtonBuy'
import { useAsset } from '@context/Asset'
import { Asset } from 'src/@types/Asset'
interface ReviewProps {
  totalPrices?: { value: string; symbol: string }[]
  datasetOrderPrice?: string
  algoOrderPrice?: string
  c2dPrice?: string
  isRequestingPrice?: boolean
  asset?: AssetExtended
  service?: Service
  isAlgorithm?: boolean
}

export default function Review({
  // totalPrices = [],
  // algoOrderPrice = '0',
  // c2dPrice = '0',
  isRequestingPrice = false,
  asset,
  service,
  isAlgorithm = false,
  accessDetails,
  datasets,
  selectedAlgorithmAsset,
  selectedDatasetAsset,
  ddoListAlgorithms,
  setSelectedDatasetAsset,
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
  setAllResourceValues,
  setOuterFieldValue
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  datasets: AssetSelectionAsset[]
  selectedDatasetAsset: AssetExtended[]
  selectedAlgorithmAsset?: AssetExtended
  ddoListAlgorithms?: Asset[]
  setSelectedDatasetAsset: React.Dispatch<React.SetStateAction<AssetExtended[]>>
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
  setOuterFieldValue?: (field: string, value: any) => void
  totalPrices?: { value: string; symbol: string }[]
  datasetOrderPrice?: string
  algoOrderPrice?: string
  c2dPrice?: string
  isRequestingPrice?: boolean
  isAlgorithm?: boolean
}): ReactElement {
  const [showCredentialsCheck, setShowCredentialsCheck] = useState(false)
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const { isValid, setFieldValue, values }: FormikContextType<FormComputeData> =
    useFormikContext()
  const { isAssetNetwork } = useAsset()

  const [algoOrderPrice, setAlgoOrderPrice] = useState<string | null>(
    selectedAlgorithmAsset?.accessDetails?.[0]?.price ??
      accessDetails.price ??
      null
  )

  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedResources = allResourceValues?.[values.computeEnv]
  const c2dPrice = selectedResources?.price
  const [allDatasetServices, setAllDatasetServices] = useState<Service[]>([])
  const [datasetVerificationIndex, setDatasetVerificationIndex] = useState(0)
  const verifiedCount = selectedDatasetAsset?.filter((asset) => {
    const svc = asset.credentialSubject?.services?.[asset.serviceIndex || 0]
    return lookupVerifierSessionId?.(asset.id, svc?.id)
  }).length
  console.log('Field values ', values)

  const [datasetOrderPrice, setDatasetOrderPrice] = useState<string | null>(
    accessDetails.price
  )
  console.log('Field values ', values)
  // const allVerified = selectedDatasetAsset?.every((asset) => {
  //   const service = asset.credentialSubject?.services?.[asset.serviceIndex || 0]
  //   return lookupVerifierSessionId?.(asset.id, service?.id)
  // })
  const selectedDatasets = Array.isArray(values?.datasets)
    ? values.datasets
    : []

  const handleCheckCredentials = (datasetId: string) => {
    setShowCredentialsCheck(true)
  }

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

  // Data arrays for mapping - now using real pricing data
  const computeItems = [
    {
      name: 'ALGORITHM',
      value: algoOrderPrice,
      duration: '1 day'
    },
    {
      name: 'C2D RESOURCES',
      value: c2dPrice,
      duration: formatDuration(values.jobDuration)
    }
  ]

  const marketFees = [
    { name: 'CONSUME MARKET ORDER FEE DATASET (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE ALGORITHM (0%)', value: '0' },
    { name: 'CONSUME MARKET ORDER FEE C2C (0%)', value: '0' }
  ]

  // Mirror agreements to outer wizard form so gating/UI can read them
  useEffect(() => {
    setOuterFieldValue &&
      setOuterFieldValue('termsAndConditions', values?.termsAndConditions)
  }, [values?.termsAndConditions, setOuterFieldValue])

  useEffect(() => {
    setOuterFieldValue &&
      setOuterFieldValue(
        'acceptPublishingLicense',
        values?.acceptPublishingLicense
      )
  }, [values?.acceptPublishingLicense, setOuterFieldValue])

  // imorted code
  useEffect(() => {
    if (!asset || !service?.id || !asset.credentialSubject?.services?.length)
      return

    const index = asset.credentialSubject.services.findIndex(
      (svc) => svc.id === service.id
    )

    if (index !== -1) setServiceIndex(index)
  }, [asset, service])
  // async function getDatasetAssets(datasets: Dataset[]): Promise<{
  //   assets: AssetExtended[]
  //   services: Service[]
  // }> {
  //   const newCancelTokenInstance = newCancelToken()
  //   const servicesCollected: Service[] = []

  //   const assets = await Promise.all(
  //     datasets.map(async (item) => {
  //       const [datasetId] = item.id
  //       const [serviceId] = item.services[0].id

  //       try {
  //         const asset = await getAsset(datasetId, newCancelTokenInstance)
  //         if (!asset || !asset.credentialSubject?.services?.length) return null

  //         const serviceIndex = asset.credentialSubject.services.findIndex(
  //           (svc: any) => svc.id === serviceId
  //         )

  //         const accessDetailsList = await Promise.all(
  //           asset.credentialSubject.services.map((service) =>
  //             getAccessDetails(
  //               asset.credentialSubject.chainId,
  //               service,
  //               accountId,
  //               newCancelTokenInstance
  //             )
  //           )
  //         )

  //         const extendedAsset: AssetExtended = {
  //           ...asset,
  //           accessDetails: accessDetailsList,
  //           serviceIndex: serviceIndex !== -1 ? serviceIndex : null
  //         }

  //         if (serviceIndex !== -1) {
  //           servicesCollected.push(
  //             asset.credentialSubject.services[serviceIndex]
  //           )
  //         }

  //         return extendedAsset
  //       } catch (error) {
  //         console.error(`Error processing dataset ${datasetId}:`, error)
  //         return null
  //       }
  //     })
  //   )

  //   return {
  //     assets: assets.filter(Boolean) as AssetExtended[],
  //     services: servicesCollected
  //   }
  // }

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
            (svc: any) => svc.id === serviceId
          )
          serviceIndexAlgo = index !== -1 ? index : null
        }
      }
    })

    return { algorithmAsset: assetDdo, serviceIndexAlgo }
  }

  // Pre-select computeEnv and/or dataset if there is only one available option
  useEffect(() => {
    if (computeEnvs?.length === 1 && !values.computeEnv) {
      const { id } = computeEnvs[0]
      setFieldValue('computeEnv', id, true)
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
    values.algorithm,
    values.computeEnv
  ])
  useEffect(() => {
    if (!values.algorithm || !isConsumable) return

    async function fetchAlgorithmAssetExtended() {
      // TODO test this type override
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

  // useEffect(() => {
  //   if (!values.dataset || !isConsumable) return

  //   async function fetchDatasetAssetsExtended() {
  //     const { assets, services } = await getDatasetAssets(values.dataset)
  //     setSelectedDatasetAsset(assets)
  //     setAllDatasetServices(services)
  //   }

  //   fetchDatasetAssetsExtended()
  // }, [values.dataset, accountId, isConsumable])

  useEffect(() => {
    if (!values.computeEnv || !computeEnvs) return

    const selectedEnv = computeEnvs.find((env) => env.id === values.computeEnv)
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
        mode: allResourceValues[selectedEnv.id]?.mode
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
    if (!isAlgorithm) return
    if (!asset?.accessDetails || !selectedDatasetAsset?.length) return

    setAlgoOrderPrice(algoOrderPriceAndFees?.price || accessDetails.price)

    const totalPrices: totalPriceMap[] = []

    let datasetPrice = new Decimal(0)
    let datasetFee = new Decimal(0)
    let datasetOrderPriceSum = new Decimal(0) // nou

    selectedDatasetAsset?.forEach((dataset) => {
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
  }, [serviceIndex, selectedDatasetAsset])

  useEffect(() => {
    if (isAlgorithm) return
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

  const PurchaseButton = () => {
    console.log('purchase is called! ')

    return (
      <ButtonBuy
        action="compute"
        disabled={
          isComputeButtonDisabled ||
          !isValid ||
          !isBalanceSufficient ||
          !isAssetNetwork ||
          !selectedDatasetAsset?.every(
            (asset) =>
              asset.accessDetails?.[asset.serviceIndex || 0]?.isPurchasable
          ) ||
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
        algorithmPriceType={asset?.accessDetails?.[0]?.type}
        isBalanceSufficient={isBalanceSufficient}
        isConsumable={isConsumable}
        consumableFeedback={consumableFeedback}
        isAlgorithmConsumable={asset?.accessDetails?.[0]?.isPurchasable}
        isSupportedOceanNetwork={isSupportedOceanNetwork}
        hasProviderFee={providerFeeAmount && providerFeeAmount !== '0'}
        retry={retry}
        isAccountConnected={isConnected}
      />
    )
  }

  // Show credentials check if needed
  if (showCredentialsCheck && asset && service) {
    return (
      <div className={styles.credentialsOverlay}>
        <div className={styles.credentialsContainer}>
          <div className={styles.credentialsHeader}>
            <h3>Verify Credentials</h3>
            <button
              className={styles.closeButton}
              onClick={() => setShowCredentialsCheck(false)}
            >
              ✕ Close
            </button>
          </div>
          {isAlgorithm ? (
            <AssetActionCheckCredentialsAlgo
              asset={asset}
              service={service}
              onVerified={() => setShowCredentialsCheck(false)}
            />
          ) : (
            <AssetActionCheckCredentials asset={asset} service={service} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <StepTitle title="Review and Purchase" />
      </div>

      <div className={styles.contentContainer}>
        <div className={styles.pricingBreakdown}>
          {/* Datasets with verification tags */}
          {selectedDatasets?.map((dataset) => {
            const allServicesVerified = dataset.services?.every((svc) =>
              lookupVerifierSessionId?.(dataset.id, svc.id)
            )
            return (
              <div key={dataset.id} className={styles.pricingRow}>
                <div className={styles.itemInfo}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <DatasetItem
                      dataset={dataset}
                      onCheckCredentials={handleCheckCredentials}
                    />
                    {allServicesVerified && (
                      <span title="Verified">
                        <ConnectedIcon width={16} height={16} />
                      </span>
                    )}
                  </div>
                </div>
                <PriceDisplay value="1" />
              </div>
            )
          })}

          {/* Dataset Services with verification tag per service */}
          {selectedDatasets?.map((dataset) =>
            dataset.services.map((service) => {
              const verified = lookupVerifierSessionId?.(dataset.id, service.id)
              return (
                <div
                  key={`${dataset.id}-${service.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <PricingRow
                    itemName={service.name}
                    value={service.price}
                    duration={service.duration}
                    isService={true}
                  />
                  {verified && (
                    <span title="Verified">
                      <ConnectedIcon width={14} height={14} />
                    </span>
                  )}
                </div>
              )
            })
          )}

          {/* Compute Items */}
          {computeItems.map((item) => (
            <PricingRow
              key={item.name}
              itemName={item.name}
              value={item.value}
              duration={item.duration}
            />
          ))}

          {/* Market Order Fees */}
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
    </div>
  )
}
