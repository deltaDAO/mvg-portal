import {
  Arweave,
  ComputeAlgorithm,
  ComputeAsset,
  ComputeEnvironment,
  downloadFileBrowser,
  FileInfo,
  Ipfs,
  LoggerInstance,
  ProviderComputeInitializeResults,
  ProviderInstance,
  UrlFile,
  UserCustomParameters,
  getErrorMessage
} from '@oceanprotocol/lib'
// if customProviderUrl is set, we need to call provider using this custom endpoint
import { customProviderUrl, oceanTokenAddress } from '../../app.config.cjs'
import { KeyValuePair } from '@shared/FormInput/InputElement/KeyValueInput'
import { Signer } from 'ethers'
import { getValidUntilTime } from './compute'
import { toast } from 'react-toastify'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { ResourceType } from 'src/@types/ResourceType'
import { PolicyServerInitiateActionData } from 'src/@types/PolicyServer'

export async function initializeProviderForCompute(
  dataset: AssetExtended,
  datasetService: Service,
  datasetAccessDetails: AccessDetails,
  algorithm: AssetExtended,
  accountId: Signer,
  computeEnv: ComputeEnvironment = null,
  selectedResources: ResourceType,
  svcIndexAlgo: number,
  sessionId: string
): Promise<ProviderComputeInitializeResults> {
  const computeAsset: ComputeAsset = {
    documentId: dataset.id,
    serviceId: datasetService.id,
    transferTxId: datasetAccessDetails.validOrderTx
  }

  const computeAlgo: ComputeAlgorithm = {
    documentId: algorithm.id,
    serviceId: algorithm.credentialSubject?.services[svcIndexAlgo].id,
    transferTxId: algorithm.accessDetails?.[svcIndexAlgo]?.validOrderTx
  }

  const validUntil = getValidUntilTime(
    selectedResources?.jobDuration,
    datasetService.timeout,
    algorithm.credentialSubject.services[svcIndexAlgo].timeout
  )

  const policyServer: PolicyServerInitiateActionData = {
    sessionId,
    successRedirectUri: ``,
    errorRedirectUri: ``,
    responseRedirectUri: ``,
    presentationDefinitionUri: ``
  }

  try {
    const resourceRequests = computeEnv.resources.map((res) => ({
      id: res.id,
      amount: selectedResources?.[res.id] || res.min
    }))
    return await ProviderInstance.initializeCompute(
      [computeAsset],
      computeAlgo,
      computeEnv?.id,
      oceanTokenAddress,
      validUntil,
      customProviderUrl || datasetService.serviceEndpoint,
      accountId,
      resourceRequests
      // dataset.credentialSubject?.chainId || algorithm.credentialSubject?.chainId,
      // policyServer
    )
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Initialize Provider] Error:', message)
    toast.error(message)
    return null
  }
}

// TODO: Why do we have these one line functions ?!?!?!
export async function getEncryptedFiles(
  files: any,
  chainId: number,
  providerUrl: string
): Promise<string> {
  try {
    // https://github.com/oceanprotocol/provider/blob/v4main/API.md#encrypt-endpoint
    const response = await ProviderInstance.encrypt(
      files,
      chainId,
      customProviderUrl || providerUrl
    )
    return response
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Provider Encrypt] Error:', message)
    toast.error(message)
  }
}

export async function getFileDidInfo(
  did: string,
  serviceId: string,
  providerUrl: string,
  withChecksum = false
): Promise<FileInfo[]> {
  try {
    const response = await ProviderInstance.checkDidFiles(
      did,
      serviceId,
      customProviderUrl || providerUrl,
      withChecksum
    )
    return response
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Initialize check file did] Error:', message)
    toast.error(`[Initialize check file did] Error: ${message}`)
    throw new Error(`[Initialize check file did] Error: ${message}`)
  }
}

export async function getFileInfo(
  file: string,
  providerUrl: string,
  storageType: string,
  query?: string,
  headers?: KeyValuePair[],
  abi?: string,
  chainId?: number,
  method?: string,
  withChecksum = false
): Promise<FileInfo[]> {
  let response
  const headersProvider = {}
  if (headers?.length > 0) {
    headers.map((el) => {
      headersProvider[el.key] = el.value
      return el
    })
  }

  switch (storageType) {
    case 'ipfs': {
      const fileIPFS: Ipfs = {
        type: storageType,
        hash: file
      }
      try {
        response = await ProviderInstance.getFileInfo(
          fileIPFS,
          customProviderUrl || providerUrl,
          withChecksum
        )
      } catch (error) {
        const message = getErrorMessage(error.message)
        LoggerInstance.error('[Provider Get File info] Error:', message)
        toast.error(message)
      }
      break
    }
    case 'arweave': {
      const fileArweave: Arweave = {
        type: storageType,
        transactionId: file
      }
      try {
        response = await ProviderInstance.getFileInfo(
          fileArweave,
          customProviderUrl || providerUrl,
          withChecksum
        )
      } catch (error) {
        const message = getErrorMessage(error.message)
        LoggerInstance.error('[Provider Get File info] Error:', message)
        toast.error(message)
      }
      break
    }
    default: {
      const fileUrl: UrlFile = {
        type: 'url',
        index: 0,
        url: file,
        headers: headersProvider,
        method
      }
      try {
        response = await ProviderInstance.getFileInfo(
          fileUrl,
          customProviderUrl || providerUrl,
          withChecksum
        )
      } catch (error) {
        const message = getErrorMessage(error.message)
        LoggerInstance.error('[Provider Get File info] Error:', message)
        toast.error(message)
      }
      break
    }
  }
  return response
}

export async function downloadFile(
  signer: Signer,
  asset: AssetExtended,
  service: Service,
  accessDetails: AccessDetails,
  accountId: string,
  verifierSessionId: string,
  validOrderTx?: string,
  userCustomParameters?: UserCustomParameters
) {
  let downloadUrl
  const policyServer: PolicyServerInitiateActionData = {
    sessionId: verifierSessionId,
    successRedirectUri: ``,
    errorRedirectUri: ``,
    responseRedirectUri: ``,
    presentationDefinitionUri: ``
  }
  try {
    downloadUrl = await ProviderInstance.getDownloadUrl(
      asset.id,
      service.id,
      0,
      validOrderTx || accessDetails.validOrderTx,
      customProviderUrl || service.serviceEndpoint,
      signer,
      policyServer,
      userCustomParameters
    )
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Provider Get download url] Error:', message)
    toast.error(message)
  }
  await downloadFileBrowser(downloadUrl)
}

export async function checkValidProvider(
  providerUrl: string
): Promise<boolean> {
  try {
    const response = await ProviderInstance.isValidProvider(providerUrl)
    return response
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Provider Check] Error:', message)
    toast.error(message)
  }
}

export async function getComputeEnvironments(
  providerUrl: string,
  chainId: number
): Promise<ComputeEnvironment[]> {
  try {
    const response = await ProviderInstance.getComputeEnvironments(providerUrl)
    const computeEnvs = Array.isArray(response) ? response : response[chainId]

    return computeEnvs
  } catch (error) {
    LoggerInstance.error(`[getComputeEnvironments] ${error.message}`)
  }
}
