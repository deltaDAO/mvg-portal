import { ReactElement, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { FormComputeData } from './_types'
import { useAccount, useNetwork } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import { datasetSteps, algorithmSteps } from './_constants'
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
  refetchJobs
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
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  useEffect(() => {
    if (!chain?.id || !accountId) return
    setFieldValue('user.chainId', chain?.id)
    setFieldValue('user.accountId', accountId)
  }, [chain?.id, accountId, setFieldValue])

  const currentStep = values.user.stepCurrent
  const steps = isAlgorithm ? algorithmSteps : datasetSteps

  // For dataset flow
  if (!isAlgorithm) {
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
        return <div>Invalid step</div>
    }
  }

  // For algorithm flow
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
      return steps[5].component
    default:
      return <div>Invalid step</div>
  }
}
