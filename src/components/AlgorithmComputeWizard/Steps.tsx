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
import { CredentialDialogProvider } from '../Asset/AssetActions/Compute/CredentialDialogProvider'
import ButtonBuy from '../Asset/AssetActions/ButtonBuy'
import { useFormikContext } from 'formik'

export default function Steps({
  asset,
  service,
  accessDetails,
  datasets,
  selectedDatasetAsset,
  selectedAlgorithmAsset,
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
  ddoListAlgorithms,
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
      return (
        <SelectDataset
          asset={asset}
          service={service}
          accessDetails={accessDetails}
        />
      )
    case 2:
      return <SelectServices />
    case 3:
      return <PreviewSelectedServices />
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
          />
          {/* <ButtonBuy
            action="compute"
            disabled={
              isComputeButtonDisabled ||
              !reviewBuy.isValid ||
              !reviewBuy.isBalanceSufficient ||
              !reviewBuy.isAssetNetwork ||
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
            isBalanceSufficient={reviewBuy.isBalanceSufficient}
            isConsumable={isConsumable}
            consumableFeedback={consumableFeedback}
            isAlgorithmConsumable={asset?.accessDetails?.[0]?.isPurchasable}
            isSupportedOceanNetwork={reviewBuy.isSupportedOceanNetwork}
            hasProviderFee={providerFeeAmount && providerFeeAmount !== '0'}
            retry={retry}
            isAccountConnected={reviewBuy.isConnected}
            computeWizard={true}
          /> */}
        </CredentialDialogProvider>
      )
    default:
      return <div>Invalid step: {currentStep}</div>
  }
}
