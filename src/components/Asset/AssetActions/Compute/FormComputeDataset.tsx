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
import { Asset, ComputeEnvironment, ZERO_ADDRESS } from '@oceanprotocol/lib'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { getTokenBalanceFromSymbol } from '@utils/wallet'
import { MAX_DECIMALS } from '@utils/constants'
import Decimal from 'decimal.js'
import { useAccount } from 'wagmi'
import useBalance from '@hooks/useBalance'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import ConsumerParameters from '../ConsumerParameters'
import { ComputeDatasetForm } from './_constants'
import CalculateButtonBuy from '../CalculateButtonBuy'
import { consumeMarketOrderFee } from 'app.config'
import { Row } from '../Row'

export default function FormStartCompute({
  algorithms,
  ddoListAlgorithms,
  selectedAlgorithmAsset,
  setSelectedAlgorithm,
  isLoading,
  isComputeButtonDisabled,
  hasPreviousOrder,
  hasDatatoken,
  dtBalance,
  assetType,
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
  setSelectedComputeEnv,
  setTermsAndConditions,
  stepText,
  isConsumable,
  consumableFeedback,
  datasetOrderPriceAndFees,
  algoOrderPriceAndFees,
  providerFeeAmount,
  validUntil,
  retry
}: {
  algorithms: AssetSelectionAsset[]
  ddoListAlgorithms: Asset[]
  selectedAlgorithmAsset: AssetExtended
  setSelectedAlgorithm: React.Dispatch<React.SetStateAction<AssetExtended>>
  isLoading: boolean
  isComputeButtonDisabled: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtBalance: string
  assetType: string
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
  setSelectedComputeEnv: React.Dispatch<
    React.SetStateAction<ComputeEnvironment>
  >
  setTermsAndConditions: React.Dispatch<React.SetStateAction<boolean>>
  stepText: string
  isConsumable: boolean
  consumableFeedback: string
  datasetOrderPriceAndFees?: OrderPriceAndFees
  algoOrderPriceAndFees?: OrderPriceAndFees
  providerFeeAmount?: string
  validUntil?: string
  retry: boolean
}): ReactElement {
  const { address: accountId, isConnected } = useAccount()
  const { balance } = useBalance()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const {
    isValid,
    setFieldValue,
    values
  }: FormikContextType<ComputeDatasetForm> = useFormikContext()
  const { asset, isAssetNetwork } = useAsset()

  const [datasetOrderPrice, setDatasetOrderPrice] = useState(
    asset?.accessDetails?.price
  )
  const [algoOrderPrice, setAlgoOrderPrice] = useState(
    selectedAlgorithmAsset?.accessDetails?.price
  )
  const [totalPrices, setTotalPrices] = useState([])
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)
  const [isFullPriceLoading, setIsFullPriceLoading] = useState(true)

  function getAlgorithmAsset(algorithmId: string): Asset {
    let assetDdo = null
    ddoListAlgorithms.forEach((ddo: Asset) => {
      if (ddo.id === algorithmId) assetDdo = ddo
    })
    return assetDdo
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
    setSelectedComputeEnv,
    values.algorithm,
    values.computeEnv
  ])

  useEffect(() => {
    if (!values.algorithm || !isConsumable) return

    async function fetchAlgorithmAssetExtended() {
      const algorithmAsset = getAlgorithmAsset(values.algorithm)
      const accessDetails = await getAccessDetails(
        algorithmAsset.chainId,
        algorithmAsset.services[0].datatokenAddress,
        algorithmAsset.services[0].timeout,
        accountId || ZERO_ADDRESS // if user is not connected, use ZERO_ADDRESS as accountId
      )
      const extendedAlgoAsset: AssetExtended = {
        ...algorithmAsset,
        accessDetails
      }
      setSelectedAlgorithm(extendedAlgoAsset)
    }
    fetchAlgorithmAssetExtended()
  }, [values.algorithm, accountId, isConsumable])

  useEffect(() => {
    if (!values.computeEnv) return
    setSelectedComputeEnv(
      computeEnvs.find((env) => env.id === values.computeEnv)
    )
  }, [computeEnvs, setSelectedComputeEnv, values.computeEnv])

  //
  // Set price for calculation output
  //
  useEffect(() => {
    if (!asset?.accessDetails || !selectedAlgorithmAsset?.accessDetails) return

    setDatasetOrderPrice(
      datasetOrderPriceAndFees?.price || asset.accessDetails.price
    )
    setAlgoOrderPrice(
      algoOrderPriceAndFees?.price ||
        selectedAlgorithmAsset?.accessDetails.price
    )
    const totalPrices: totalPriceMap[] = []
    const priceDataset =
      !datasetOrderPrice || hasPreviousOrder || hasDatatoken
        ? new Decimal(0)
        : new Decimal(datasetOrderPrice).toDecimalPlaces(MAX_DECIMALS)
    const priceAlgo =
      !algoOrderPrice ||
      hasPreviousOrderSelectedComputeAsset ||
      hasDatatokenSelectedComputeAsset
        ? new Decimal(0)
        : new Decimal(algoOrderPrice).toDecimalPlaces(MAX_DECIMALS)
    const providerFees = providerFeeAmount
      ? new Decimal(providerFeeAmount).toDecimalPlaces(MAX_DECIMALS)
      : new Decimal(0)

    const feeAlgo = new Decimal(consumeMarketOrderFee).mul(priceAlgo).div(100)
    const feeProvider = new Decimal(consumeMarketOrderFee)
      .mul(providerFees)
      .div(100)
    const feeDataset = new Decimal(consumeMarketOrderFee)
      .mul(priceDataset)
      .div(100)

    if (algorithmSymbol === providerFeesSymbol) {
      let sum = providerFees.add(priceAlgo).add(feeProvider).add(feeAlgo)
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
        const sum = providerFees
          .add(priceDataset)
          .add(feeProvider)
          .add(feeDataset)
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
          value: providerFees
            .add(feeProvider)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
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
          value: providerFees
            .add(feeProvider)
            .toDecimalPlaces(MAX_DECIMALS)
            .toString(),
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
    asset,
    hasPreviousOrder,
    hasDatatoken,
    hasPreviousOrderSelectedComputeAsset,
    hasDatatokenSelectedComputeAsset,
    datasetOrderPriceAndFees,
    algoOrderPriceAndFees,
    providerFeeAmount,
    isAssetNetwork,
    selectedAlgorithmAsset?.accessDetails,
    datasetOrderPrice,
    algoOrderPrice,
    algorithmSymbol,
    datasetSymbol,
    providerFeesSymbol
  ])

  useEffect(() => {
    totalPrices.forEach((price) => {
      const baseTokenBalance = getTokenBalanceFromSymbol(balance, price.symbol)
      if (!baseTokenBalance) {
        setIsBalanceSufficient(false)
        return
      }

      // if one comparison of baseTokenBalance and token price comparison is false then the state will be false
      setIsBalanceSufficient(
        baseTokenBalance && compareAsBN(baseTokenBalance, `${price.value}`)
      )
    })
  }, [balance, dtBalance, datasetSymbol, algorithmSymbol, totalPrices])

  const PurchaseButton = () => (
    <ButtonBuy
      action="compute"
      disabled={
        isComputeButtonDisabled ||
        !isValid ||
        !isBalanceSufficient ||
        !isAssetNetwork ||
        !selectedAlgorithmAsset?.accessDetails?.isPurchasable ||
        !isAccountIdWhitelisted
      }
      hasPreviousOrder={hasPreviousOrder}
      hasDatatoken={hasDatatoken}
      btSymbol={asset?.accessDetails?.baseToken?.symbol}
      dtSymbol={asset?.datatokens[0]?.symbol}
      dtBalance={dtBalance}
      assetTimeout={assetTimeout}
      assetType={assetType}
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
      priceType={asset?.accessDetails?.type}
      algorithmPriceType={selectedAlgorithmAsset?.accessDetails?.type}
      isBalanceSufficient={isBalanceSufficient}
      isConsumable={isConsumable}
      consumableFeedback={consumableFeedback}
      isAlgorithmConsumable={
        selectedAlgorithmAsset?.accessDetails?.isPurchasable
      }
      isSupportedOceanNetwork={isSupportedOceanNetwork}
      hasProviderFee={providerFeeAmount && providerFeeAmount !== '0'}
      retry={retry}
      isAccountConnected={isConnected}
    />
  )

  const handleFullPrice = () => {
    console.log('handle')
    setIsFullPriceLoading(false)
  }

  const CalculateButton = () => (
    <div style={{ textAlign: 'center' }}>
      <CalculateButtonBuy
        type="submit"
        onClick={handleFullPrice}
        isLoading={isLoading}
      />
    </div>
  )

  const AssetActionBuy = ({ asset }: { asset: AssetExtended }) => {
    console.log('totalPrice:', totalPrices)
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
              algorithmConsumeDetails={selectedAlgorithmAsset?.accessDetails}
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
              {new Decimal(
                datasetOrderPrice || asset?.accessDetails?.price || 0
              ).greaterThan(0) && (
                <Row
                  hasPreviousOrder={hasPreviousOrder}
                  hasDatatoken={hasDatatoken}
                  price={new Decimal(
                    datasetOrderPrice || asset?.accessDetails?.price || 0
                  )
                    .toDecimalPlaces(MAX_DECIMALS)
                    .toString()}
                  timeout={assetTimeout}
                  symbol={datasetSymbol}
                  type="DATASET"
                />
              )}
              {new Decimal(
                algoOrderPrice ||
                  selectedAlgorithmAsset?.accessDetails?.price ||
                  0
              ).greaterThan(0) && (
                <Row
                  hasPreviousOrder={hasPreviousOrderSelectedComputeAsset}
                  hasDatatoken={hasDatatokenSelectedComputeAsset}
                  price={new Decimal(
                    algoOrderPrice ||
                      selectedAlgorithmAsset?.accessDetails?.price ||
                      0
                  )
                    .toDecimalPlaces(MAX_DECIMALS)
                    .toString()}
                  timeout={selectedComputeAssetTimeout}
                  symbol={algorithmSymbol}
                  type="ALGORITHM"
                />
              )}
              {new Decimal(providerFeeAmount).greaterThan(0) && (
                <Row
                  price={providerFeeAmount} // initializeCompute.provider fee amount
                  timeout={`${validUntil} seconds`} // valid until value
                  symbol={providerFeesSymbol} // we assume that provider fees will always be in OCEAN token
                  type="C2D RESOURCES"
                />
              )}
              {new Decimal(consumeMarketOrderFee)
                .mul(
                  new Decimal(
                    datasetOrderPrice || asset?.accessDetails?.price || 0
                  )
                )
                .div(100)
                .greaterThan(0) && (
                <Row
                  price={new Decimal(consumeMarketOrderFee)
                    .mul(
                      new Decimal(
                        datasetOrderPrice || asset?.accessDetails?.price || 0
                      )
                    )
                    .toDecimalPlaces(MAX_DECIMALS)
                    .div(100)
                    .toString()} // consume market order fee fee amount
                  symbol={datasetSymbol} // we assume that provider fees will always be in OCEAN token
                  type="CONSUME MARKET ORDER FEE DATASET"
                />
              )}
              {new Decimal(consumeMarketOrderFee)
                .mul(
                  new Decimal(
                    algoOrderPrice ||
                      selectedAlgorithmAsset?.accessDetails?.price ||
                      0
                  )
                )
                .div(100)
                .greaterThan(0) && (
                <Row
                  price={new Decimal(consumeMarketOrderFee)
                    .mul(
                      new Decimal(
                        algoOrderPrice ||
                          selectedAlgorithmAsset?.accessDetails?.price ||
                          0
                      )
                    )
                    .toDecimalPlaces(MAX_DECIMALS)
                    .div(100)
                    .toString()} // consume market order fee fee amount
                  symbol={algorithmSymbol} // we assume that provider fees will always be in OCEAN token
                  type="CONSUME MARKET ORDER FEE ALGORITHM"
                />
              )}
              {new Decimal(consumeMarketOrderFee)
                .mul(new Decimal(providerFeeAmount))
                .div(100)
                .greaterThan(0) && (
                <Row
                  price={new Decimal(consumeMarketOrderFee)
                    .mul(new Decimal(providerFeeAmount))
                    .toDecimalPlaces(MAX_DECIMALS)
                    .div(100)
                    .toString()} // consume market order fee fee amount
                  symbol={providerFeesSymbol} // we assume that provider fees will always be in OCEAN token
                  type="CONSUME MARKET ORDER FEE CDD"
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
            <PurchaseButton />
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
        />
      ))}
      {asset && selectedAlgorithmAsset && (
        <ConsumerParameters
          asset={asset}
          selectedAlgorithmAsset={selectedAlgorithmAsset}
          isLoading={isLoading}
        />
      )}

      {isFullPriceLoading ? (
        <CalculateButton />
      ) : (
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
        </>
      )}
    </Form>
  )
}
