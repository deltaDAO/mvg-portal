import { ReactElement, useEffect } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { datasetSteps, algorithmSteps } from './_constants' // Updated import
import SelectAlgorithm from './SelectAlgorithm'
import SelectServices from './SelectServices'
import PreviewSelectedServices from './PreviewSelectedServices'
import SelectEnvironment from './SelectEnvironment'
import SelectDataset from './SelectDataset'
import ConfigureEnvironment from './ConfigureEnvironment'
import Review from './Review'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ResourceType } from 'src/@types/ResourceType'
import { Asset } from 'src/@types/Asset'
import { FormComputeData, StepContent } from './_types'

export default function Steps({
  asset,
  service,
  accessDetails,
  datasets,
  selectedDatasetAsset,
  setSelectedAlgorithmAsset,
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
  isAlgorithm,
  algorithms,
  onRunInitPriceAndFees,
  setAllResourceValues,
  onCheckAlgoDTBalance,
  jobs,
  isLoadingJobs,
  refetchJobs,
  formikValues, // Updated type below
  setFieldValue
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
  formikValues: FormComputeData // Updated to FormComputeData
  setFieldValue: (field: string, value: any) => void
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => {
    if (!chain?.id || !accountId) return
    setFieldValue('user.chainId', chain?.id)
    setFieldValue('user.accountId', accountId)
  }, [chain?.id, accountId, setFieldValue])

  const currentStep = formikValues?.user?.stepCurrent ?? 1
  const steps = isAlgorithm ? algorithmSteps : datasetSteps

  console.log(
    'Steps component - currentStep:',
    currentStep,
    'isAlgorithm:',
    isAlgorithm,
    'values.user:',
    formikValues.user,
    'step type:',
    typeof currentStep
  )

  // For dataset flow
  if (!isAlgorithm) {
    console.log(
      'Dataset flow - currentStep:',
      currentStep,
      'type:',
      typeof currentStep
    )
    switch (currentStep) {
      case 1:
        return <SelectAlgorithm algorithms={algorithms} />
      case 2:
        return <SelectEnvironment computeEnvs={computeEnvs} />
      case 3:
        return <ConfigureEnvironment />
      case 4:
        return <Review />
      default:
        console.log('Dataset flow - no matching case for step:', currentStep)
        return <div>Invalid step: {currentStep}</div>
    }
  }

  // For algorithm flow
  console.log(
    'Algorithm flow - currentStep:',
    currentStep,
    'type:',
    typeof currentStep
  )
  switch (currentStep) {
    case 1:
      return <SelectDataset />
    case 2:
      return <SelectServices />
    case 3:
      return <PreviewSelectedServices />
    case 4:
      return <SelectEnvironment computeEnvs={computeEnvs} />
    case 5:
      return <ConfigureEnvironment />
    case 6:
      return <Review />
    default:
      console.log('Algorithm flow - no matching case for step:', currentStep)
      return <div>Invalid step: {currentStep}</div>
  }
}
