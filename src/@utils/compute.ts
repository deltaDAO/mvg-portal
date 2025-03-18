import {
  getHash,
  LoggerInstance,
  ProviderInstance,
  ComputeEnvironment,
  ComputeJob,
  getErrorMessage,
  ComputeAlgorithm
} from '@oceanprotocol/lib'
import { CancelToken } from 'axios'
import {
  queryMetadata,
  getFilterTerm,
  generateBaseQuery,
  getAssetsFromDids
} from './aquarius'
import { getServiceById } from './ddo'
import { SortTermOptions } from '../@types/aquarius/SearchQuery'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { transformAssetToAssetSelection } from './assetConverter'
import { ComputeEditForm } from '../components/Asset/Edit/_types'
import { getFileDidInfo } from './provider'
import { toast } from 'react-toastify'
import { Asset } from 'src/@types/Asset'
import {
  Compute,
  Service,
  PublisherTrustedAlgorithms
} from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'

async function getAssetMetadata(
  queryDtList: string[],
  cancelToken: CancelToken,
  chainIds: number[],
  index?: string
): Promise<Asset[]> {
  const baseQueryparams = {
    index: index ?? 'op_ddo_v5.0.0',
    chainIds,
    filters: [
      getFilterTerm('services.datatokenAddress.keyword', queryDtList),
      getFilterTerm('services.type', 'compute'),
      getFilterTerm('metadata.type', 'dataset')
    ],
    ignorePurgatory: true
  } as BaseQueryParams
  const query = generateBaseQuery(baseQueryparams)
  const result = await queryMetadata(query, cancelToken)
  return result?.results
}

export async function isOrderable(
  asset: AssetExtended,
  serviceId: string,
  algorithm: ComputeAlgorithm,
  algorithmDDO: Asset
): Promise<boolean> {
  const datasetService: Service = getServiceById(asset, serviceId)
  if (!datasetService) return false

  if (datasetService.type === 'compute') {
    if (algorithm.meta) {
      // check if raw algo is allowed
      if (datasetService.compute.allowRawAlgorithm) return true
      LoggerInstance.error('ERROR: This service does not allow raw algorithm')
      return false
    }
    if (algorithm.documentId) {
      const algoService: Service = getServiceById(
        algorithmDDO,
        algorithm.serviceId
      )
      if (algoService && algoService.type === 'compute') {
        if (algoService.serviceEndpoint !== datasetService.serviceEndpoint) {
          this.logger.error(
            'ERROR: Both assets with compute service are not served by the same provider'
          )
          return false
        }
      }
    }
  }
  return true
}

export function getValidUntilTime(
  computeEnvMaxJobDuration: number,
  datasetTimeout?: number,
  algorithmTimeout?: number
) {
  const inputValues = []
  computeEnvMaxJobDuration && inputValues.push(computeEnvMaxJobDuration)
  datasetTimeout && inputValues.push(datasetTimeout)
  algorithmTimeout && inputValues.push(algorithmTimeout)

  const minValue = Math.min(...inputValues)
  const mytime = new Date()
  mytime.setMinutes(mytime.getMinutes() + Math.floor(minValue / 60))
  return Math.floor(mytime.getTime() / 1000)
}

export async function getComputeEnvironment(
  asset: Asset
): Promise<ComputeEnvironment> {
  if (asset?.credentialSubject?.services[0]?.type !== 'compute') return null
  try {
    const computeEnvs = await ProviderInstance.getComputeEnvironments(
      asset.credentialSubject?.services[0].serviceEndpoint
    )
    const computeEnv = Array.isArray(computeEnvs)
      ? computeEnvs[0]
      : computeEnvs[asset?.credentialSubject?.chainId][0]

    if (!computeEnv) return null
    return computeEnv
  } catch (e) {
    const message = getErrorMessage(e.message)
    LoggerInstance.error(
      '[Compute to Data] Fetch compute environment:',
      message
    )
    toast.error(message)
  }
}

export function getQueryString(
  trustedAlgorithmList: PublisherTrustedAlgorithms[],
  trustedPublishersList: string[],
  chainId?: number
): SearchQuery {
  const algorithmDidList = trustedAlgorithmList?.map((x) => x.did)

  const baseParams = {
    chainIds: [chainId],
    sort: { sortBy: SortTermOptions.Created },
    filters: [getFilterTerm('metadata.type', 'algorithm')],
    esPaginationOptions: {
      size: 3000
    }
  } as BaseQueryParams
  algorithmDidList?.length > 0 &&
    baseParams.filters.push(getFilterTerm('_id', algorithmDidList))
  trustedPublishersList?.length > 0 &&
    baseParams.filters.push(
      getFilterTerm(
        'nft.owner',
        trustedPublishersList.map((address) => address.toLowerCase())
      )
    )
  const query = generateBaseQuery(baseParams)

  return query
}

export async function getAlgorithmsForAsset(
  asset: Asset,
  service: Service,
  token: CancelToken
): Promise<Asset[]> {
  if (
    !service.compute ||
    (service.compute.publisherTrustedAlgorithms?.length === 0 &&
      service.compute.publisherTrustedAlgorithmPublishers?.length === 0)
  ) {
    return []
  }

  const gueryResults = await queryMetadata(
    getQueryString(
      service.compute.publisherTrustedAlgorithms,
      service.compute.publisherTrustedAlgorithmPublishers,
      asset.credentialSubject?.chainId
    ),
    token
  )
  const algorithms: Asset[] = gueryResults?.results
  return algorithms
}

export async function getAlgorithmAssetSelectionList(
  service: Service,
  algorithms: Asset[],
  accountId: string
): Promise<AssetSelectionAsset[]> {
  if (!algorithms || algorithms?.length === 0) return []

  let algorithmSelectionList: AssetSelectionAsset[]
  if (!service.compute) {
    algorithmSelectionList = []
  } else {
    algorithmSelectionList = await transformAssetToAssetSelection(
      service?.serviceEndpoint,
      algorithms,
      accountId,
      []
    )
  }
  return algorithmSelectionList
}

async function getJobs(
  providerUrls: string[],
  accountId: string,
  assets: Asset[]
): Promise<ComputeJobMetaData[]> {
  const uniqueProviders = [...new Set(providerUrls)]
  const providersComputeJobsExtended: ComputeJobExtended[] = []
  const computeJobs: ComputeJobMetaData[] = []
  try {
    for (let i = 0; i < uniqueProviders.length; i++) {
      const providerComputeJobs = (await ProviderInstance.computeStatus(
        uniqueProviders[i],
        accountId
      )) as ComputeJob[]
      providerComputeJobs.forEach((job) =>
        providersComputeJobsExtended.push({
          ...job,
          providerUrl: uniqueProviders[i]
        })
      )
    }

    if (providersComputeJobsExtended) {
      providersComputeJobsExtended.sort((a, b) => {
        if (a.dateCreated > b.dateCreated) {
          return -1
        }
        if (a.dateCreated < b.dateCreated) {
          return 1
        }
        return 0
      })

      providersComputeJobsExtended.forEach((job) => {
        const did = job.inputDID[0]
        const asset = assets.filter((x) => x.id === did)[0]
        if (asset) {
          const compJob: ComputeJobMetaData = {
            ...job,
            assetName: asset.credentialSubject?.metadata?.name,
            assetDtSymbol: asset.credentialSubject?.datatokens[0].symbol,
            networkId: asset.credentialSubject.chainId
          }
          computeJobs.push(compJob)
        }
      })
    }
  } catch (err) {
    const message = getErrorMessage(err.message)
    LoggerInstance.error('[Compute to Data] Error:', message)
    toast.error(message)
  }
  return computeJobs
}

export async function getComputeJobs(
  chainIds: number[],
  accountId: string,
  asset: AssetExtended,
  service: Service,
  cancelToken?: CancelToken
): Promise<ComputeResults> {
  if (!accountId) return
  if (!service) return
  const datatokenAddressList = [service.datatokenAddress]
  const computeResult: ComputeResults = {
    computeJobs: [],
    isLoaded: false
  }
  if (!datatokenAddressList) return
  const assets = await getAssetMetadata(
    datatokenAddressList,
    cancelToken,
    chainIds
  )

  const providerUrls: string[] = []
  assets.forEach((asset: Asset) =>
    providerUrls.push(asset.credentialSubject.services[0].serviceEndpoint)
  )

  computeResult.computeJobs = await getJobs(providerUrls, accountId, assets)
  computeResult.isLoaded = true

  return computeResult
}

export async function createTrustedAlgorithmList(
  selectedAlgorithms: string[], // list of DIDs,
  assetChainId: number,
  cancelToken: CancelToken
): Promise<PublisherTrustedAlgorithms[]> {
  const trustedAlgorithms: PublisherTrustedAlgorithms[] = []

  // Condition to prevent app from hitting Aquarius with empty DID list
  // when nothing is selected in the UI.
  if (!selectedAlgorithms || selectedAlgorithms.length === 0)
    return trustedAlgorithms

  const selectedAssets = await getAssetsFromDids(
    selectedAlgorithms,
    [assetChainId],
    cancelToken
  )

  if (!selectedAssets || selectedAssets.length === 0) return []

  for (const selectedAlgorithm of selectedAssets) {
    const filesChecksum = await getFileDidInfo(
      selectedAlgorithm?.id,
      selectedAlgorithm?.credentialSubject?.services?.[0].id,
      selectedAlgorithm?.credentialSubject?.services?.[0]?.serviceEndpoint,
      true
    )
    const containerChecksum =
      selectedAlgorithm.credentialSubject?.metadata.algorithm.container
        .entrypoint
    const trustedAlgorithm: PublisherTrustedAlgorithms = {
      did: selectedAlgorithm.id,
      containerSectionChecksum: getHash(containerChecksum),
      filesChecksum: filesChecksum?.[0]?.checksum,
      serviceId: ''
    }
    trustedAlgorithms.push(trustedAlgorithm)
  }
  return trustedAlgorithms
}

export async function transformComputeFormToServiceComputeOptions(
  values: ComputeEditForm,
  currentOptions: Compute,
  assetChainId: number,
  cancelToken: CancelToken
): Promise<Compute> {
  const publisherTrustedAlgorithms = values.allowAllPublishedAlgorithms
    ? null
    : await createTrustedAlgorithmList(
        values.publisherTrustedAlgorithms,
        assetChainId,
        cancelToken
      )

  // TODO: add support for selecting trusted publishers and transforming here.
  // This only deals with basics so we don't accidentially allow all accounts
  // to be trusted.
  const publisherTrustedAlgorithmPublishers: string[] = []

  const privacy: Compute = {
    ...currentOptions,
    publisherTrustedAlgorithms,
    publisherTrustedAlgorithmPublishers
  }

  return privacy
}
