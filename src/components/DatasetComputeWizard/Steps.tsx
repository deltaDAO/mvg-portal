import { ReactElement, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import SelectAlgorithm from './SelectAlgorithm'
import SelectAlgorithmServices from './SelectAlgorithmServices'
import PreviewAlgorithmDataset from './PreviewAlgorithmDataset'
import SelectEnvironment from './SelectEnvironment'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ResourceType } from 'src/@types/ResourceType'
import { Asset } from 'src/@types/Asset'
import { FormComputeData } from './_types'
import { CredentialDialogProvider } from '../Asset/AssetActions/Compute/CredentialDialogProvider'
import { useFormikContext } from 'formik'
import { Signer } from 'ethers'
import UserParametersStep from './UserParametersStep'
import { UserParameter } from './types/DatasetSelection'

export default function Steps({
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
  refetchJobs, // Updated type below
  setFieldValue,
  isAlgorithm,
  formikValues,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient
}: {
  asset: AssetExtended
  service: Service
  signer?: Signer
  accessDetails: AccessDetails
  datasets?: AssetSelectionAsset[]
  algorithms?: AssetSelectionAsset[]
  selectedDatasetAsset?: AssetExtended[]
  ddoListAlgorithms?: Asset[]
  selectedAlgorithmAsset?: AssetExtended
  setSelectedAlgorithmAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended>
  >
  setSelectedDatasetAsset?: React.Dispatch<
    React.SetStateAction<AssetExtended[]>
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
  isAlgorithm?: boolean
  allResourceValues?: {
    [envId: string]: ResourceType
  }
  onRunInitPriceAndFees?: () => Promise<any>
  onCheckAlgoDTBalance?: () => Promise<void>
  setAllResourceValues?: React.Dispatch<
    React.SetStateAction<{
      [envId: string]: ResourceType
    }>
  >
  jobs?: any[]
  isLoadingJobs?: boolean
  refetchJobs?: () => void
  formikValues?: FormComputeData // Updated to FormComputeData
  setFieldValue: (field: string, value: any) => void
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient: boolean
  setIsBalanceSufficient: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  const { address: accountId } = useAccount()
  const chainId = useChainId()
  const { values } = useFormikContext<FormComputeData>()

  useEffect(() => {
    if (!chainId || !accountId) return
    setFieldValue('user.chainId', chainId)
    setFieldValue('user.accountId', accountId)
  }, [chainId, accountId, setFieldValue])

  const currentStep = values?.user?.stepCurrent ?? 1
  const hasUserParamsStep = Boolean(values.isUserParameters)
  useEffect(() => {
    if (!asset || !service) return
    setFieldValue('dataset', [`${asset.id}|${service.id}`])
    if (service.consumerParameters?.length) {
      const algoParams = service.consumerParameters.map(
        (p: any): UserParameter => ({
          name: p.name,
          label: p.label ?? p.name,
          description: p.description,
          type: p.type ?? 'text',
          default: p.default,
          required: p.required ?? false,
          options: p.options ?? [],
          value: p.default ?? ''
        })
      )
      setFieldValue('datasetServiceParams', [
        {
          did: asset.id,
          serviceId: service.id,
          userParameters: algoParams
        }
      ])
    }
  }, [asset, service, setFieldValue])

  switch (currentStep) {
    case 1:
      return <SelectAlgorithm algorithms={algorithms} />
    case 2:
      return (
        <SelectAlgorithmServices
          selectedAlgorithmAsset={selectedAlgorithmAsset}
          ddoListAlgorithms={ddoListAlgorithms}
        />
      )
    case 3:
      return (
        <PreviewAlgorithmDataset
          selectedAlgorithmAsset={selectedAlgorithmAsset}
        />
      )
    case 4:
      if (hasUserParamsStep) {
        return <UserParametersStep asset={asset} service={service} />
      } else {
        return <SelectEnvironment computeEnvs={computeEnvs} />
      }
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
          // lazy comment when removing pricingStepText
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
          // lazy comment when removing pricingStepText
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
