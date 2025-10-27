import { ReactElement, useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { datasetSteps, algorithmSteps } from './_constants' // Updated import
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
import { FormComputeData, StepContent } from './_types'
import { CredentialDialogProvider } from '../Asset/AssetActions/Compute/CredentialDialogProvider'
import ButtonBuy from '../Asset/AssetActions/ButtonBuy'
import { useFormikContext } from 'formik'

export default function Steps({
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
  refetchJobs, // Updated type below
  setFieldValue,
  isAlgorithm,
  formikValues
}: {
  asset: AssetExtended
  service: Service
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
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const { values } = useFormikContext<FormComputeData>()

  useEffect(() => {
    if (!chain?.id || !accountId) return
    setFieldValue('user.chainId', chain?.id)
    setFieldValue('user.accountId', accountId)
  }, [chain?.id, accountId, setFieldValue])

  const currentStep = values?.user?.stepCurrent ?? 1

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
      return <SelectEnvironment computeEnvs={computeEnvs} />
    case 5:
      return (
        <ConfigureEnvironment
          allResourceValues={allResourceValues}
          setAllResourceValues={setAllResourceValues}
        />
      )
    case 6:
      return (
        <CredentialDialogProvider>
          <Review
            asset={asset}
            service={service}
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
          />
        </CredentialDialogProvider>
      )
    default:
      console.log('Dataset flow - no matching case for step:', currentStep)
      return <div>Invalid step: {currentStep}</div>
  }
}
