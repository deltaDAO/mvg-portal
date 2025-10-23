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
import { Asset } from 'src/@types/Asset'
import { AssetExtended } from 'src/@types/AssetExtended'
import { useCancelToken } from '@hooks/useCancelToken'
import { ResourceType } from 'src/@types/ResourceType'
import { useSsiWallet } from '@context/SsiWallet'
import { AssetActionCheckCredentialsAlgo } from '../CheckCredentials/checkCredentialsAlgo'
import ComputeHistory from './History'
import ComputeJobs from '../../../Profile/History/ComputeJobs'
import FormErrorGroup from '@shared/FormInput/CheckboxGroupWithErrors'

export default function FormStartCompute({
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
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  algorithms: AssetSelectionAsset[]
  ddoListAlgorithms: Asset[]
  selectedAlgorithmAsset: AssetExtended
  setSelectedAlgorithmAsset: React.Dispatch<React.SetStateAction<AssetExtended>>
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
  onRunInitPriceAndFees: () => Promise<void>
  onCheckAlgoDTBalance: () => Promise<void>
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
}): ReactElement {
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { verifierSessionCache, lookupVerifierSessionId } = useSsiWallet()
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const {
    isValid,
    setFieldValue,
    values
  }: FormikContextType<ComputeDatasetForm> = useFormikContext()
  console.log('Field values ', values)
  const { isAssetNetwork } = useAsset() // TODO - is this needed?

  const [datasetOrderPrice, setDatasetOrderPrice] = useState<string | null>(
    accessDetails.price
  )

  const [algoOrderPrice, setAlgoOrderPrice] = useState(
    selectedAlgorithmAsset?.accessDetails?.[0]?.price
  )
  const [serviceIndex, setServiceIndex] = useState(0)
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const selectedResources = allResourceValues?.[values.computeEnv]
  const c2dPrice = selectedResources?.price
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

  // Pre-select computeEnv and/or algo if there is only one available option
  useEffect(() => {
    if (computeEnvs?.length === 1 && !values.computeEnv) {
      const { id } = computeEnvs[0]
      setFieldValue('computeEnv', id, true)
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
    />
  )

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
              algorithmConsumeDetails={
                selectedAlgorithmAsset?.accessDetails[serviceIndex]
              }
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
            <>Select an algorithm to calculate the Compute Job price</>
          ) : (
            <div className={styles.calculation}>
              <Row
                hasPreviousOrder={hasPreviousOrder}
                hasDatatoken={hasDatatoken}
                price={new Decimal(
                  datasetOrderPrice || accessDetails.price || 0
                )
                  .toDecimalPlaces(MAX_DECIMALS)
                  .toString()}
                timeout={assetTimeout}
                symbol={datasetSymbol}
                type="DATASET"
              />

              <Row
                hasPreviousOrder={hasPreviousOrderSelectedComputeAsset}
                hasDatatoken={hasDatatokenSelectedComputeAsset}
                price={new Decimal(
                  algoOrderPrice ||
                    selectedAlgorithmAsset?.accessDetails[serviceIndex]
                      ?.price ||
                    0
                )
                  .toDecimalPlaces(MAX_DECIMALS)
                  .toString()}
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
                    new Decimal(datasetOrderPrice || accessDetails.price || 0)
                      .toDecimalPlaces(MAX_DECIMALS)
                      .div(100)
                  )
                  .toString()} // consume market order fee fee amount
                symbol={datasetSymbol}
                type={`CONSUME MARKET ORDER FEE DATASET (${consumeMarketOrderFee}%)`}
              />

              <Row
                price={new Decimal(consumeMarketOrderFee)
                  .mul(
                    new Decimal(
                      algoOrderPrice ||
                        selectedAlgorithmAsset?.accessDetails[serviceIndex]
                          ?.price ||
                        0
                    )
                      .toDecimalPlaces(MAX_DECIMALS)
                      .div(100)
                  )
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
            {appConfig.ssiEnabled && selectedAlgorithmAsset ? (
              (() => {
                const hasAlgorithmSession =
                  verifierSessionCache &&
                  lookupVerifierSessionId(
                    `${selectedAlgorithmAsset?.id}`,
                    selectedAlgorithmAsset?.credentialSubject?.services?.[
                      serviceIndex
                    ]?.id
                  )
                console.log('FormComputeDataset algorithm credential check:', {
                  ssiEnabled: appConfig.ssiEnabled,
                  selectedAlgorithmAsset: !!selectedAlgorithmAsset,
                  verifierSessionCache: !!verifierSessionCache,
                  algorithmId: selectedAlgorithmAsset?.id,
                  serviceId:
                    selectedAlgorithmAsset?.credentialSubject?.services?.[
                      serviceIndex
                    ]?.id,
                  sessionId: lookupVerifierSessionId(
                    `${selectedAlgorithmAsset?.id}`,
                    selectedAlgorithmAsset?.credentialSubject?.services?.[
                      serviceIndex
                    ]?.id
                  ),
                  hasAlgorithmSession: !!hasAlgorithmSession
                })
                return hasAlgorithmSession ? (
                  <>
                    <FormErrorGroup
                      errorFields={[
                        'termsAndConditions',
                        'acceptPublishingLicense'
                      ]}
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
                    <PurchaseButton />
                  </>
                ) : (
                  <div style={{ marginTop: '60px', marginLeft: '10px' }}>
                    <AssetActionCheckCredentialsAlgo
                      asset={selectedAlgorithmAsset}
                      service={
                        selectedAlgorithmAsset?.credentialSubject?.services?.[
                          serviceIndex
                        ]
                      }
                    />
                  </div>
                )
              })()
            ) : (
              <>
                <FormErrorGroup
                  errorFields={[
                    'termsAndConditions',
                    'acceptPublishingLicense'
                  ]}
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
                <PurchaseButton />
              </>
            )}
          </div>
        </>
      </div>
    )
  }

  return (
    <Form className={styles.form}>
      {content.form.data.map((field: FormFieldContent) => (
        <Field
          key={field.name}
          {...field}
          component={Input}
          disabled={isLoading || isComputeButtonDisabled}
          options={
            field.name === 'algorithm'
              ? algorithms
              : field.name === 'computeEnv'
              ? computeEnvs
              : field?.options
          }
          accountId={accountId}
          selected={
            field.name === 'algorithm'
              ? values.algorithm
              : field.name === 'computeEnv'
              ? values.computeEnv
              : undefined
          }
          setAllResourceValues={
            field.name === 'computeEnv' ? setAllResourceValues : undefined
          }
        />
      ))}
      {asset && selectedAlgorithmAsset && (
        <ConsumerParameters
          services={[service]}
          selectedAlgorithmAsset={selectedAlgorithmAsset}
          isLoading={isLoading}
          svcIndex={serviceIndex}
        />
      )}

      {/* Compute Jobs Section */}
      {accountId &&
        accessDetails.datatoken &&
        asset.credentialSubject.metadata.type !== 'algorithm' && (
          <ComputeHistory title="Your Compute Jobs" refetchJobs={refetchJobs}>
            <ComputeJobs
              minimal
              jobs={jobs || []}
              isLoading={isLoadingJobs || false}
              refetchJobs={refetchJobs}
            />
          </ComputeHistory>
        )}

      {/* {isFullPriceLoading ? (
        <CalculateButton />
      ) : ( */}
      <>
        <AssetActionBuy asset={asset} />
      </>
    </Form>
  )
}
