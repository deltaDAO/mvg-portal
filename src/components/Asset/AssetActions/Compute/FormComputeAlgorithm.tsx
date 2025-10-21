import { ReactElement, useEffect, useState } from 'react'
import styles from './FormComputeDataset.module.css'
import { Field, Form, FormikContextType, useFormikContext } from 'formik'
import Input from '@shared/FormInput'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { compareAsBN } from '@utils/numbers'
import ButtonBuy from '../ButtonBuy'
import PriceOutput from './PriceOutput'
import { useAsset } from '@context/Asset'
import content from '../../../../../content/pages/startComputeDataset.json'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { MAX_DECIMALS } from '@utils/constants'
import Decimal from 'decimal.js'
import { useAccount } from 'wagmi'
import useBalance from '@hooks/useBalance'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import ConsumerParameters from '../ConsumerParameters'
import { ComputeDatasetForm } from './_constants'
import appConfig, { consumeMarketOrderFee } from 'app.config.cjs'
import { Row } from '../Row'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { useCancelToken } from '@hooks/useCancelToken'
import { ResourceType } from 'src/@types/ResourceType'
import { useSsiWallet } from '@context/SsiWallet'
import { AssetActionCheckCredentialsAlgo } from '../CheckCredentials/checkCredentialsAlgo'
import AlgorithmDatasetsListForComputeSelection from './AlgorithmDatasetsListForComputeSelection'
import { getAsset } from '@utils/aquarius'

export default function FormStartComputeAlgo({
  asset,
  service,
  accessDetails,
  datasets,
  selectedDatasetAsset,
  setSelectedDatasetAsset,
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
  setAllResourceValues
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  datasets: AssetSelectionAsset[]
  selectedDatasetAsset: AssetExtended[]
  setSelectedDatasetAsset: React.Dispatch<React.SetStateAction<AssetExtended[]>>
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
}): ReactElement {
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const {
    isValid,
    setFieldValue,
    values
  }: FormikContextType<ComputeDatasetForm> = useFormikContext()
  const { isAssetNetwork } = useAsset()

  const [algoOrderPrice, setAlgoOrderPrice] = useState<string | null>(
    accessDetails.price
  )

  const [datasetOrderPrice, setDatasetOrderPrice] = useState('0')
  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedResources = allResourceValues?.[values.computeEnv]
  const c2dPrice = selectedResources?.price
  const [allDatasetServices, setAllDatasetServices] = useState<Service[]>([])
  const [datasetVerificationIndex, setDatasetVerificationIndex] = useState(0)
  const verifiedCount = selectedDatasetAsset.filter((asset) => {
    const svc = asset.credentialSubject?.services?.[asset.serviceIndex || 0]
    return lookupVerifierSessionId?.(asset.id, svc?.id)
  }).length
  console.log('Field values ', values)
  const allVerified = selectedDatasetAsset.every((asset) => {
    const service = asset.credentialSubject?.services?.[asset.serviceIndex || 0]
    return lookupVerifierSessionId?.(asset.id, service?.id)
  })

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
    if (!values.dataset || !isConsumable) return

    async function fetchDatasetAssetsExtended() {
      const { assets, services } = await getDatasetAssets(values.dataset)
      setSelectedDatasetAsset(assets)
      setAllDatasetServices(services)
    }

    fetchDatasetAssetsExtended()
  }, [values.dataset, accountId, isConsumable])

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
        mode: values.mode
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
  }, [serviceIndex, selectedDatasetAsset])

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

  const AssetActionBuy = ({ asset }: { asset: AssetExtended }) => {
    function formatDuration(seconds: number): string {
      const d = Math.floor(seconds / 86400)
      const h = Math.floor((seconds % 86400) / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      const parts: string[] = []
      if (d) parts.push(`${d}d`)
      if (h) parts.push(`${h}h`)
      if (m) parts.push(`${m}m`)
      if (s) parts.push(`${s}s`)

      const result = parts.join(' ') || '0s'
      return result
    }

    return (
      <div style={{ textAlign: 'left' }}>
        <>
          <div>
            <PriceOutput
              hasPreviousOrder={hasPreviousOrder}
              assetTimeout={assetTimeout}
              hasPreviousOrderSelectedComputeAsset={
                hasPreviousOrderSelectedComputeAsset
              }
              hasDatatoken={hasDatatoken}
              selectedComputeAssetTimeout={selectedComputeAssetTimeout}
              hasDatatokenSelectedComputeAsset={
                hasDatatokenSelectedComputeAsset
              }
              algorithmConsumeDetails={asset?.accessDetails[serviceIndex]}
              symbol={datasetSymbol}
              algorithmSymbol={algorithmSymbol}
              datasetOrderPrice={datasetOrderPrice}
              algoOrderPrice={algoOrderPrice}
              providerFeeAmount={providerFeeAmount}
              providerFeesSymbol={providerFeesSymbol}
              validUntil={validUntil}
              totalPrices={totalPrices}
              showInformation={false}
            />
          </div>
          {totalPrices.length === 0 ? (
            <>Select a dataset to calculate the Compute Job price</>
          ) : (
            <div className={styles.calculation}>
              <Row
                price={new Decimal(
                  datasetOrderPrice ||
                    selectedDatasetAsset
                      ?.map((a) =>
                        Number(
                          a.accessDetails?.[a.serviceIndex || 0]?.price || 0
                        )
                      )
                      .reduce((acc, val) => acc + val, 0)
                )
                  .toDecimalPlaces(MAX_DECIMALS)
                  .toString()}
                timeout={assetTimeout}
                symbol={datasetSymbol}
                type="DATASETS"
              />

              <Row
                hasPreviousOrder={hasPreviousOrderSelectedComputeAsset}
                hasDatatoken={hasDatatokenSelectedComputeAsset}
                price={
                  accessDetails?.validOrderTx
                    ? '0'
                    : new Decimal(algoOrderPrice || accessDetails?.price || 0)
                        .toDecimalPlaces(MAX_DECIMALS)
                        .toString()
                }
                timeout={selectedComputeAssetTimeout}
                symbol={algorithmSymbol}
                type="ALGORITHM"
              />

              {computeEnvs?.length > 0 && (
                <Row
                  price={selectedResources?.price?.toString() || '0'}
                  timeout={formatDuration(selectedResources?.jobDuration || 0)}
                  symbol={providerFeesSymbol}
                  type="C2D RESOURCES"
                />
              )}

              <Row
                price={new Decimal(consumeMarketOrderFee)
                  .mul(
                    new Decimal(
                      selectedDatasetAsset
                        ?.map((a) =>
                          Number(
                            a.accessDetails?.[a.serviceIndex || 0]?.price || 0
                          )
                        )
                        .reduce((acc, val) => acc + val, 0)
                    )
                  )
                  .toDecimalPlaces(MAX_DECIMALS)
                  .div(100)
                  .toString()}
                symbol={datasetSymbol}
                type={`CONSUME MARKET ORDER FEE DATASETS (${consumeMarketOrderFee}%)`}
              />
              <Row
                price={new Decimal(consumeMarketOrderFee)
                  .mul(new Decimal(algoOrderPrice || accessDetails.price || 0))
                  .toDecimalPlaces(MAX_DECIMALS)
                  .div(100)
                  .toString()} // consume market order fee fee amount
                symbol={algorithmSymbol}
                type={`CONSUME MARKET ORDER FEE ALGORITHM (${consumeMarketOrderFee}%)`}
              />

              {computeEnvs?.length > 0 && (
                <Row
                  price={new Decimal(consumeMarketOrderFee)
                    .mul(new Decimal(selectedResources?.price || 0))
                    .toDecimalPlaces(MAX_DECIMALS)
                    .div(100)
                    .toString()}
                  symbol={providerFeesSymbol}
                  type={`CONSUME MARKET ORDER FEE C2D (${consumeMarketOrderFee}%)`}
                />
              )}
              {totalPrices.map((item) =>
                new Decimal(item.value).greaterThan(0) ? (
                  <Row
                    price={item.value}
                    symbol={item.symbol}
                    key={item.symbol}
                  />
                ) : null
              )}
            </div>
          )}
          <div style={{ textAlign: 'center' }}>
            {appConfig.ssiEnabled && selectedDatasetAsset?.length > 0 ? (
              <>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  {verifiedCount} of {selectedDatasetAsset.length} datasets
                  verified
                </div>

                <div style={{ marginTop: '60px', marginLeft: '10px' }}>
                  {allVerified ? (
                    <PurchaseButton />
                  ) : (
                    selectedDatasetAsset.map((asset, i) => {
                      const service =
                        asset.credentialSubject?.services?.[
                          asset.serviceIndex || 0
                        ]
                      const isVerified = lookupVerifierSessionId?.(
                        asset.id,
                        service?.id
                      )

                      if (!isVerified && i === datasetVerificationIndex) {
                        return (
                          <AssetActionCheckCredentialsAlgo
                            key={asset.id}
                            asset={asset}
                            service={service}
                            type="dataset"
                            onVerified={() =>
                              setDatasetVerificationIndex(i + 1)
                            }
                          />
                        )
                      }

                      return null
                    })
                  )}
                </div>
              </>
            ) : (
              <PurchaseButton />
            )}
          </div>
        </>
      </div>
    )
  }

  return (
    <Form className={styles.form}>
      {content.form.data.map((field: FormFieldContent) =>
        field.name === 'computeEnv' ? (
          <Field
            key={field.name}
            {...field}
            component={Input}
            disabled={isLoading || isComputeButtonDisabled}
            options={computeEnvs}
            accountId={accountId}
            selected={values.computeEnv || []}
            setAllResourceValues={setAllResourceValues}
          />
        ) : null
      )}
      <AlgorithmDatasetsListForComputeSelection
        asset={asset}
        service={service}
        accessDetails={accessDetails}
      />
      {asset && selectedDatasetAsset && (
        <ConsumerParameters
          services={allDatasetServices}
          selectedAlgorithmAsset={asset}
          isLoading={isLoading}
          svcIndex={serviceIndex}
        />
      )}

      <>
        <AssetActionBuy asset={asset} />
        <Field
          component={Input}
          name="termsAndConditions"
          type="checkbox"
          options={['Terms and Conditions']}
          prefixes={['I agree to the']}
          actions={['/terms']}
          disabled={isLoading}
        />
        <Field
          component={Input}
          name="acceptPublishingLicense"
          type="checkbox"
          options={['Publishing License']}
          prefixes={['I agree the']}
          disabled={isLoading}
        />
      </>
    </Form>
  )
}
