import { ReactElement, useEffect, useState } from 'react'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { ComputeEnvironment } from '@oceanprotocol/lib'
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
import { FormComputeData } from './_types'
import { useFormikContext } from 'formik'
import UserParametersStep from './UserParametersStep'
import { UserParameter } from './types/DatasetSelection'
import { getOceanConfig } from '@utils/ocean'
import { getTokenInfo } from '@utils/wallet'
import { JsonRpcProvider } from 'ethers'

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
  setFieldValue,
  datasetProviderFeeProp,
  algorithmProviderFeeProp,
  isBalanceSufficient,
  setIsBalanceSufficient
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
  datasetProviderFeeProp?: string
  algorithmProviderFeeProp?: string
  isBalanceSufficient: boolean
  setIsBalanceSufficient: React.Dispatch<React.SetStateAction<boolean>>
}): ReactElement {
  const { address: accountId } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()
  const { values } = useFormikContext<FormComputeData>()

  const rpcUrl = getOceanConfig(chainId)?.nodeUri

  const ethersProvider =
    publicClient && rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined

  useEffect(() => {
    if (!chainId || !accountId) return
    setFieldValue('user.chainId', chainId)
    setFieldValue('user.accountId', accountId)
  }, [chainId, accountId, setFieldValue])

  const currentStep = values?.user?.stepCurrent ?? 1

  const hasUserParamsStep = Boolean(values.isUserParameters)

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | undefined>(undefined)

  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!chainId || !ethersProvider) return

      const { oceanTokenAddress } = getOceanConfig(chainId)
      const tokenDetails = await getTokenInfo(oceanTokenAddress, ethersProvider)

      setTokenInfo(tokenDetails)
    }

    fetchTokenDetails()
  }, [chainId, ethersProvider])

  useEffect(() => {
    if (!asset || !service) return

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

      setFieldValue('algorithmServiceParams', [
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
      return <PreviewSelectedServices service={service} />
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
