import { ReactElement, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useFormikContext } from 'formik'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { Asset } from 'src/@types/Asset'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { Signer } from 'ethers'
import { ResourceType } from 'src/@types/ResourceType'
import { ComputeFlow, FormComputeData } from './_types'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'
import UserParametersStep from './UserParametersStep'
import SelectPrimaryAsset from './SelectPrimaryAsset'
import SelectServicesStep from './SelectServicesStep'
import PreviewSelectionStep from './PreviewSelectionStep'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'

type SetState<T> = React.Dispatch<React.SetStateAction<T>>

interface StepsProps {
  flow: ComputeFlow
  asset: AssetExtended
  service: Service
  signer?: Signer
  accessDetails: AccessDetails
  datasets?: AssetSelectionAsset[]
  algorithms?: AssetSelectionAsset[]
  selectedDatasetAsset?: AssetExtended[]
  ddoListAlgorithms?: Asset[]
  selectedAlgorithmAsset?: AssetExtended
  setSelectedAlgorithmAsset?: SetState<AssetExtended>
  setSelectedDatasetAsset?: SetState<AssetExtended[]>
  isLoading: boolean
  isComputeButtonDisabled: boolean
  hasPreviousOrder: boolean
  hasDatatoken: boolean
  dtBalance: string
  assetTimeout: string
  hasPreviousOrderSelectedComputeAsset?: boolean
  hasDatatokenSelectedComputeAsset?: boolean
  isAccountIdWhitelisted?: boolean
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
  onRunInitPriceAndFees?: () => Promise<unknown>
  onCheckAlgoDTBalance?: () => Promise<void>
  setAllResourceValues?: SetState<{
    [envId: string]: ResourceType
  }>
  jobs?: ComputeJobMetaData[]
  isLoadingJobs?: boolean
  refetchJobs?: () => void
  formikValues?: FormComputeData
  setFieldValue: (field: string, value: unknown) => void
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient: boolean
  setIsBalanceSufficient: SetState<boolean>
}

type WizardUserParameter = {
  name: string
  label: string
  description?: string
  type?: string
  default?: string | number | boolean
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  value?: string | number | boolean
}

type ConsumerParameter = {
  name: string
  label?: string
  description?: string
  type?: string
  default?: string | number | boolean
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
}

export default function Steps({
  flow,
  asset,
  service,
  signer,
  accessDetails,
  datasets,
  algorithms,
  ddoListAlgorithms,
  selectedAlgorithmAsset,
  setSelectedAlgorithmAsset,
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
  algorithmSymbol,
  providerFeesSymbol,
  dtSymbolSelectedComputeAsset,
  dtBalanceSelectedComputeAsset,
  selectedComputeAssetTimeout,
  computeEnvs,
  stepText,
  isConsumable,
  consumableFeedback,
  datasetOrderPriceAndFees,
  algoOrderPriceAndFees,
  retry,
  allResourceValues,
  setAllResourceValues,
  setFieldValue,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient
}: StepsProps): ReactElement {
  const { address: accountId } = useAccount()
  const { values } = useFormikContext<FormComputeData>()
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)

  useEffect(() => {
    const chainId = asset?.credentialSubject?.chainId
    if (!chainId || !accountId) return
    setFieldValue('user.chainId', chainId)
    setFieldValue('user.accountId', accountId)
  }, [asset?.credentialSubject?.chainId, accountId, setFieldValue])

  useEffect(() => {
    if (!asset || !service) return
    setFieldValue('dataset', [`${asset.id}|${service.id}`])

    const hasParams = Boolean(service.consumerParameters?.length)

    if (flow === 'dataset') {
      if (!hasParams) {
        setFieldValue('datasetServiceParams', [])
        return
      }

      const entries = service.consumerParameters.map(
        (param: ConsumerParameter): WizardUserParameter => ({
          name: param.name,
          label: param.label ?? param.name,
          description: param.description,
          type: param.type ?? 'text',
          default: param.default,
          required: param.required ?? false,
          options: param.options ?? [],
          value: param.default ?? ''
        })
      )

      setFieldValue('datasetServiceParams', [
        {
          did: asset.id,
          serviceId: service.id,
          userParameters: entries
        }
      ])
      return
    }

    setFieldValue('isUserParameters', hasParams)

    if (!hasParams) {
      setFieldValue('algorithmServiceParams', [])
      return
    }

    const entries = service.consumerParameters.map(
      (param: ConsumerParameter): WizardUserParameter => ({
        name: param.name,
        label: param.label ?? param.name,
        description: param.description,
        type: param.type ?? 'text',
        default: param.default,
        required: param.required ?? false,
        options: param.options ?? [],
        value: param.default ?? ''
      })
    )

    setFieldValue('algorithmServiceParams', [
      {
        did: asset.id,
        serviceId: service.id,
        userParameters: entries
      }
    ])
  }, [asset, service, setFieldValue, flow])

  useEffect(() => {
    if (flow !== 'algorithm') return
    const chainId = asset?.credentialSubject?.chainId
    const provider = signer?.provider
    if (!chainId || !provider) return

    const fetchTokenDetails = async () => {
      const { oceanTokenAddress } = getOceanConfig(chainId)
      const info = await getTokenInfo(oceanTokenAddress, provider)
      setTokenInfo(info)
    }

    fetchTokenDetails()
  }, [flow, asset?.credentialSubject?.chainId, signer])

  const currentStep = values?.user?.stepCurrent ?? 1
  const hasUserParamsStep = Boolean(values.isUserParameters)

  function renderDatasetFlow() {
    switch (currentStep) {
      case 1:
        return (
          <SelectPrimaryAsset
            flow="dataset"
            algorithms={algorithms}
            asset={asset}
            service={service}
            accessDetails={accessDetails}
          />
        )
      case 2:
        return (
          <SelectServicesStep
            flow="dataset"
            ddoListAlgorithms={ddoListAlgorithms}
          />
        )
      case 3:
        return <PreviewSelectionStep flow="dataset" />
      case 4:
        return hasUserParamsStep ? (
          <UserParametersStep flow={flow} asset={asset} service={service} />
        ) : (
          <SelectEnvironment computeEnvs={computeEnvs} />
        )
      case 5:
        return hasUserParamsStep ? (
          <SelectEnvironment computeEnvs={computeEnvs} />
        ) : (
          <ConfigureEnvironment
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
          />
        )
      case 6:
        return hasUserParamsStep ? (
          <ConfigureEnvironment
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
          />
        ) : (
          <Review
            flow="dataset"
            asset={asset}
            service={service}
            signer={signer}
            isRequestingPrice={false}
            accessDetails={accessDetails}
            isLoading={isLoading}
            selectedAlgorithmAsset={selectedAlgorithmAsset}
            setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
            isComputeButtonDisabled={isComputeButtonDisabled}
            hasPreviousOrder={hasPreviousOrder}
            hasDatatoken={hasDatatoken}
            dtBalance={dtBalance}
            ddoListAlgorithms={ddoListAlgorithms}
            assetTimeout={assetTimeout}
            hasPreviousOrderSelectedComputeAsset={
              hasPreviousOrderSelectedComputeAsset
            }
            hasDatatokenSelectedComputeAsset={hasDatatokenSelectedComputeAsset}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            datasetSymbol={
              accessDetails.baseToken?.symbol ||
              (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            algorithmSymbol={algorithmSymbol}
            providerFeesSymbol={providerFeesSymbol}
            dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
            dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
            selectedComputeAssetType="algorithm"
            selectedComputeAssetTimeout={selectedComputeAssetTimeout}
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
            stepText={stepText}
            isConsumable={isConsumable}
            consumableFeedback={consumableFeedback}
            datasetOrderPriceAndFees={datasetOrderPriceAndFees}
            algoOrderPriceAndFees={algoOrderPriceAndFees}
            retry={retry}
            computeEnvs={computeEnvs}
            datasetProviderFeeProp={datasetProviderFeeProp}
            algorithmProviderFeeProp={algorithmProviderFeeProp}
            isBalanceSufficient={isBalanceSufficient}
            setIsBalanceSufficient={setIsBalanceSufficient}
          />
        )
      case 7:
        return hasUserParamsStep ? (
          <Review
            flow="dataset"
            asset={asset}
            service={service}
            signer={signer}
            isRequestingPrice={false}
            accessDetails={accessDetails}
            isLoading={isLoading}
            selectedAlgorithmAsset={selectedAlgorithmAsset}
            setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
            isComputeButtonDisabled={isComputeButtonDisabled}
            hasPreviousOrder={hasPreviousOrder}
            hasDatatoken={hasDatatoken}
            dtBalance={dtBalance}
            ddoListAlgorithms={ddoListAlgorithms}
            assetTimeout={assetTimeout}
            hasPreviousOrderSelectedComputeAsset={
              hasPreviousOrderSelectedComputeAsset
            }
            hasDatatokenSelectedComputeAsset={hasDatatokenSelectedComputeAsset}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            datasetSymbol={
              accessDetails.baseToken?.symbol ||
              (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            algorithmSymbol={algorithmSymbol}
            providerFeesSymbol={providerFeesSymbol}
            dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
            dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
            selectedComputeAssetType="algorithm"
            selectedComputeAssetTimeout={selectedComputeAssetTimeout}
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
            stepText={stepText}
            isConsumable={isConsumable}
            consumableFeedback={consumableFeedback}
            datasetOrderPriceAndFees={datasetOrderPriceAndFees}
            algoOrderPriceAndFees={algoOrderPriceAndFees}
            retry={retry}
            computeEnvs={computeEnvs}
            datasetProviderFeeProp={datasetProviderFeeProp}
            algorithmProviderFeeProp={algorithmProviderFeeProp}
            isBalanceSufficient={isBalanceSufficient}
            setIsBalanceSufficient={setIsBalanceSufficient}
          />
        ) : (
          <div>Invalid step</div>
        )
      default:
        return <div>Invalid step: {currentStep}</div>
    }
  }

  function renderAlgorithmFlow() {
    if (values.withoutDataset) {
      switch (currentStep) {
        case 1:
          return (
            <SelectPrimaryAsset
              flow="algorithm"
              asset={asset}
              service={service}
              accessDetails={accessDetails}
              algorithms={algorithms}
            />
          )
        case 2:
          return hasUserParamsStep ? (
            <UserParametersStep flow={flow} asset={asset} service={service} />
          ) : (
            <SelectEnvironment computeEnvs={computeEnvs} />
          )
        case 3:
          return hasUserParamsStep ? (
            <SelectEnvironment computeEnvs={computeEnvs} />
          ) : (
            <ConfigureEnvironment
              allResourceValues={allResourceValues}
              setAllResourceValues={setAllResourceValues}
            />
          )
        case 4:
          return hasUserParamsStep ? (
            <ConfigureEnvironment
              allResourceValues={allResourceValues}
              setAllResourceValues={setAllResourceValues}
            />
          ) : (
            <Review
              flow="algorithm"
              asset={asset}
              service={service}
              signer={signer}
              isRequestingPrice={false}
              accessDetails={accessDetails}
              isLoading={isLoading}
              selectedDatasetAsset={selectedDatasetAsset}
              setSelectedDatasetAsset={setSelectedDatasetAsset}
              algorithms={algorithms}
              selectedAlgorithmAsset={selectedAlgorithmAsset}
              setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
              isComputeButtonDisabled={isComputeButtonDisabled}
              hasPreviousOrder={hasPreviousOrder}
              hasDatatoken={hasDatatoken}
              dtBalance={dtBalance}
              assetTimeout={assetTimeout}
              hasPreviousOrderSelectedComputeAsset={
                hasPreviousOrderSelectedComputeAsset
              }
              hasDatatokenSelectedComputeAsset={
                hasDatatokenSelectedComputeAsset
              }
              isAccountIdWhitelisted={isAccountIdWhitelisted}
              datasetSymbol={
                accessDetails.baseToken?.symbol ||
                (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
              }
              algorithmSymbol={algorithmSymbol}
              providerFeesSymbol={providerFeesSymbol}
              dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
              dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
              selectedComputeAssetType="algorithm"
              selectedComputeAssetTimeout={selectedComputeAssetTimeout}
              allResourceValues={allResourceValues}
              setAllResourceValues={setAllResourceValues}
              stepText={stepText}
              isConsumable={isConsumable}
              consumableFeedback={consumableFeedback}
              datasetOrderPriceAndFees={datasetOrderPriceAndFees}
              algoOrderPriceAndFees={algoOrderPriceAndFees}
              retry={retry}
              computeEnvs={computeEnvs}
              datasetProviderFeeProp={datasetProviderFeeProp}
              algorithmProviderFeeProp={algorithmProviderFeeProp}
              isBalanceSufficient={isBalanceSufficient}
              setIsBalanceSufficient={setIsBalanceSufficient}
            />
          )
        case 5:
          return hasUserParamsStep ? (
            <Review
              flow="algorithm"
              asset={asset}
              service={service}
              signer={signer}
              isRequestingPrice={false}
              accessDetails={accessDetails}
              isLoading={isLoading}
              selectedDatasetAsset={selectedDatasetAsset}
              setSelectedDatasetAsset={setSelectedDatasetAsset}
              algorithms={algorithms}
              selectedAlgorithmAsset={selectedAlgorithmAsset}
              setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
              isComputeButtonDisabled={isComputeButtonDisabled}
              hasPreviousOrder={hasPreviousOrder}
              hasDatatoken={hasDatatoken}
              dtBalance={dtBalance}
              assetTimeout={assetTimeout}
              hasPreviousOrderSelectedComputeAsset={
                hasPreviousOrderSelectedComputeAsset
              }
              hasDatatokenSelectedComputeAsset={
                hasDatatokenSelectedComputeAsset
              }
              isAccountIdWhitelisted={isAccountIdWhitelisted}
              datasetSymbol={
                accessDetails.baseToken?.symbol ||
                (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
              }
              algorithmSymbol={algorithmSymbol}
              providerFeesSymbol={providerFeesSymbol}
              dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
              dtBalanceSelectedComputeAsset={dtBalanceSelectedComputeAsset}
              selectedComputeAssetType="algorithm"
              selectedComputeAssetTimeout={selectedComputeAssetTimeout}
              allResourceValues={allResourceValues}
              setAllResourceValues={setAllResourceValues}
              stepText={stepText}
              isConsumable={isConsumable}
              consumableFeedback={consumableFeedback}
              datasetOrderPriceAndFees={datasetOrderPriceAndFees}
              algoOrderPriceAndFees={algoOrderPriceAndFees}
              retry={retry}
              computeEnvs={computeEnvs}
              datasetProviderFeeProp={datasetProviderFeeProp}
              algorithmProviderFeeProp={algorithmProviderFeeProp}
              isBalanceSufficient={isBalanceSufficient}
              setIsBalanceSufficient={setIsBalanceSufficient}
            />
          ) : (
            <div>Invalid step</div>
          )
        default:
          return <div>Invalid step: {currentStep}</div>
      }
    }

    switch (currentStep) {
      case 1:
        return (
          <SelectPrimaryAsset
            flow="algorithm"
            asset={asset}
            service={service}
            accessDetails={accessDetails}
            algorithms={algorithms}
          />
        )
      case 2:
        return <SelectServicesStep flow="algorithm" />
      case 3:
        return <PreviewSelectionStep flow="algorithm" />
      case 4:
        return hasUserParamsStep ? (
          <UserParametersStep flow={flow} asset={asset} service={service} />
        ) : (
          <SelectEnvironment computeEnvs={computeEnvs} />
        )
      case 5:
        return hasUserParamsStep ? (
          <SelectEnvironment computeEnvs={computeEnvs} />
        ) : (
          <ConfigureEnvironment
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
          />
        )
      case 6:
        return hasUserParamsStep ? (
          <ConfigureEnvironment
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
          />
        ) : (
          <Review
            flow="algorithm"
            asset={asset}
            service={service}
            signer={signer}
            totalPrices={[]}
            datasetOrderPrice="0"
            algoOrderPrice="0"
            isRequestingPrice={false}
            accessDetails={accessDetails}
            datasets={datasets}
            selectedDatasetAsset={selectedDatasetAsset}
            setSelectedDatasetAsset={setSelectedDatasetAsset}
            hasPreviousOrder={hasPreviousOrder}
            hasDatatoken={hasDatatoken}
            dtBalance={dtBalance}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            datasetSymbol={
              accessDetails.baseToken?.symbol ||
              (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            algorithmSymbol={algorithmSymbol}
            providerFeesSymbol={providerFeesSymbol}
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
            isConsumable={isConsumable}
            algoOrderPriceAndFees={algoOrderPriceAndFees}
            computeEnvs={computeEnvs}
            datasetProviderFeeProp={datasetProviderFeeProp}
            algorithmProviderFeeProp={algorithmProviderFeeProp}
            isBalanceSufficient={isBalanceSufficient}
            setIsBalanceSufficient={setIsBalanceSufficient}
            tokenInfo={tokenInfo}
          />
        )
      case 7:
        return hasUserParamsStep ? (
          <Review
            flow="algorithm"
            asset={asset}
            service={service}
            signer={signer}
            totalPrices={[]}
            datasetOrderPrice="0"
            algoOrderPrice="0"
            isRequestingPrice={false}
            accessDetails={accessDetails}
            datasets={datasets}
            selectedDatasetAsset={selectedDatasetAsset}
            setSelectedDatasetAsset={setSelectedDatasetAsset}
            hasPreviousOrder={hasPreviousOrder}
            hasDatatoken={hasDatatoken}
            dtBalance={dtBalance}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            datasetSymbol={
              accessDetails.baseToken?.symbol ||
              (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            algorithmSymbol={algorithmSymbol}
            providerFeesSymbol={providerFeesSymbol}
            allResourceValues={allResourceValues}
            setAllResourceValues={setAllResourceValues}
            isConsumable={isConsumable}
            algoOrderPriceAndFees={algoOrderPriceAndFees}
            computeEnvs={computeEnvs}
            datasetProviderFeeProp={datasetProviderFeeProp}
            algorithmProviderFeeProp={algorithmProviderFeeProp}
            isBalanceSufficient={isBalanceSufficient}
            setIsBalanceSufficient={setIsBalanceSufficient}
            tokenInfo={tokenInfo}
          />
        ) : (
          <div>Invalid step</div>
        )
      default:
        return <div>Invalid step: {currentStep}</div>
    }
  }

  return flow === 'algorithm' ? renderAlgorithmFlow() : renderDatasetFlow()
}
