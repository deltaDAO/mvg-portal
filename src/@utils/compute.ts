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
import {
  transformAssetToAssetSelection,
  transformAssetToAssetSelectionForComputeWizard
} from './assetConverter'
import { getFileDidInfo } from './provider'
import { toast } from 'react-toastify'
import { Asset } from 'src/@types/Asset'
import {
  Compute,
  Service,
  PublisherTrustedAlgorithms
} from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { customProviderUrl } from 'app.config.cjs'
import { ServiceComputeOptions } from '@oceanprotocol/ddo-js'
import { useNetwork } from 'wagmi'
// Local form shape needed by compute transform
type ComputeFormLike = {
  allowAllPublishedAlgorithms: boolean | string
  publisherTrustedAlgorithms: string[]
  publisherTrustedAlgorithmPublishers: string
  publisherTrustedAlgorithmPublishersAddresses?: string
}

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
      getFilterTerm(
        'credentialSubject.services.datatokenAddress.keyword',
        queryDtList
      ),
      getFilterTerm('credentialSubject.services.type', 'compute'),
      getFilterTerm('credentialSubject.metadata.type', 'dataset')
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
  chainId?: number,
  allAlgosAllowed?: boolean
): SearchQuery {
  const algorithmDidList = trustedAlgorithmList?.map((x) => x.did)

  const baseParams = {
    chainIds: [chainId],
    sort: { sortBy: SortTermOptions.Created },
    filters: [getFilterTerm('credentialSubject.metadata.type', 'algorithm')],
    esPaginationOptions: {
      size: 3000
    }
  } as BaseQueryParams
  algorithmDidList?.length > 0 &&
    !allAlgosAllowed &&
    baseParams.filters.push(getFilterTerm('_id', algorithmDidList))

  if (
    trustedPublishersList?.length > 0 &&
    !(trustedPublishersList.length === 1 && trustedPublishersList[0] === '*')
  ) {
    baseParams.filters.push(
      getFilterTerm(
        'indexedMetadata.nft.owner',
        trustedPublishersList.map((address) => address.toLowerCase())
      )
    )
  }
  const query = generateBaseQuery(baseParams)
  return query
}

function isAllAlgoAllowed(compute: ServiceComputeOptions): boolean {
  // Check if publisherTrustedAlgorithmPublishers contains "*"
  if (
    Array.isArray(compute.publisherTrustedAlgorithmPublishers) &&
    compute.publisherTrustedAlgorithmPublishers.includes('*')
  ) {
    return true
  }

  // Check if publisherTrustedAlgorithms contains a single object where all values are "*"
  if (
    Array.isArray(compute.publisherTrustedAlgorithms) &&
    compute.publisherTrustedAlgorithms.length === 1
  ) {
    const algo = compute.publisherTrustedAlgorithms[0]
    return Object.values(algo).every((value) => value === '*')
  }

  return false
}

export async function getAlgorithmsForAsset(
  asset: Asset,
  service: Service,
  token: CancelToken
): Promise<Asset[]> {
  if (
    !service?.compute ||
    (service.compute.publisherTrustedAlgorithms?.length === 0 &&
      service.compute.publisherTrustedAlgorithmPublishers?.length === 0)
  ) {
    return []
  }
  const allAlgosAllowed = isAllAlgoAllowed(service.compute)
  const queryResults = await queryMetadata(
    getQueryString(
      service.compute.publisherTrustedAlgorithms,
      service.compute.publisherTrustedAlgorithmPublishers,
      asset.credentialSubject?.chainId,
      allAlgosAllowed
    ),
    token
  )
  const algorithms: Asset[] = queryResults?.results
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
      service.compute.publisherTrustedAlgorithms
    )
  }
  return algorithmSelectionList
}

export async function getAlgorithmAssetSelectionListForComputeWizard(
  service: Service,
  algorithms: Asset[],
  accountId: string
): Promise<AssetSelectionAsset[]> {
  if (!algorithms || algorithms?.length === 0) return []

  let algorithmSelectionList: AssetSelectionAsset[]
  if (!service.compute) {
    algorithmSelectionList = []
  } else {
    algorithmSelectionList =
      await transformAssetToAssetSelectionForComputeWizard(
        service?.serviceEndpoint,
        algorithms,
        accountId,
        service.compute.publisherTrustedAlgorithms
      )
  }
  return algorithmSelectionList
}

async function getJobs(
  providerUrls: string[],
  accountId: string,
  assets?: Asset[],
  cancelToken?: CancelToken
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
      type LocalComputeJob = ComputeJobExtended & {
        assets?: Array<{ documentId: string }>
      }
      providersComputeJobsExtended.forEach(async (job: ComputeJobExtended) => {
        const jobWithAssets = job as LocalComputeJob
        const did = jobWithAssets.assets
          ? jobWithAssets.assets[0].documentId
          : null
        if (assets) {
          const assetFiltered = assets.filter((x) => x.id === did)
          const asset = assetFiltered.length > 0 ? assetFiltered[0] : null
          if (asset) {
            const compJob: ComputeJobMetaData = {
              ...job,
              assetName: asset.credentialSubject?.metadata?.name,
              assetDtSymbol: asset.indexedMetadata?.stats[0].symbol,
              networkId: asset.credentialSubject.chainId
            }
            computeJobs.push(compJob)
          }
        } else {
          const compJob: ComputeJobMetaData = {
            ...job,
            assetName: 'name',
            assetDtSymbol: 'symbol',
            networkId: 11155111
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
  const datatokenAddressList = [service?.datatokenAddress]
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
  assets?.forEach((asset: Asset) =>
    providerUrls.push(asset.credentialSubject.services[0].serviceEndpoint)
  )
  computeResult.computeJobs = await getJobs(
    providerUrls,
    accountId,
    assets,
    cancelToken
  )
  computeResult.isLoaded = true

  return computeResult
}

export async function getAllComputeJobs(
  accountId: string,
  cancelToken?: CancelToken
): Promise<ComputeResults> {
  if (!accountId) return
  const computeResult: ComputeResults = {
    computeJobs: [],
    isLoaded: false
  }

  const providerUrls = [customProviderUrl]
  computeResult.computeJobs = await getJobs(
    providerUrls,
    accountId,
    null,
    cancelToken
  )
  computeResult.isLoaded = true

  return computeResult
}

export async function createTrustedAlgorithmList(
  selectedAlgorithms: string[],
  assetChainId: number,
  cancelToken: CancelToken
): Promise<PublisherTrustedAlgorithms[]> {
  const trustedAlgorithms: PublisherTrustedAlgorithms[] = []

  // Condition to prevent app from hitting Aquarius with empty DID list
  // when nothing is selected in the UI.
  if (!selectedAlgorithms || selectedAlgorithms.length === 0)
    return trustedAlgorithms

  const parsed = selectedAlgorithms.map(
    (s) =>
      JSON.parse(s) as {
        algoDid: string
        serviceId: string
      }
  )
  const didList = parsed.map((algo) => algo.algoDid)
  const selectedAssets = await getAssetsFromDids(
    didList,
    [assetChainId],
    cancelToken
  )
  if (!selectedAssets || selectedAssets.length === 0) return []

  for (const { algoDid, serviceId } of parsed) {
    const asset = selectedAssets.find((a) => a.id === algoDid)
    if (!asset) continue
    const svc = asset.credentialSubject.services.find((s) => s.id === serviceId)
    if (!svc) continue
    const filesChecksum = await getFileDidInfo(
      asset.id,
      svc.id,
      svc.serviceEndpoint,
      true
    )

    const container = asset.credentialSubject?.metadata.algorithm.container
    const containerSectionChecksum = getHash(
      container?.entrypoint + container?.checksum
    )
    const trustedAlgorithm: PublisherTrustedAlgorithms = {
      did: asset.id,
      containerSectionChecksum,
      filesChecksum: filesChecksum?.[0]?.checksum,
      serviceId: svc.id
    }
    trustedAlgorithms.push(trustedAlgorithm)
  }
  return trustedAlgorithms
}

export async function transformComputeFormToServiceComputeOptions(
  values: ComputeFormLike,
  currentOptions: Compute,
  assetChainId: number,
  cancelToken: CancelToken
): Promise<Compute> {
  const allowAny =
    values.allowAllPublishedAlgorithms === true ||
    values.allowAllPublishedAlgorithms === 'Allow any published algorithms' ||
    values.publisherTrustedAlgorithmPublishers ===
      'Allow all trusted algorithm publishers'

  const publisherTrustedAlgorithms = allowAny
    ? [
        {
          did: '*',
          containerSectionChecksum: '*',
          filesChecksum: '*',
          serviceId: '*'
        }
      ]
    : await createTrustedAlgorithmList(
        values.publisherTrustedAlgorithms,
        assetChainId,
        cancelToken
      )
  const publisherTrustedAlgorithmPublishers: string[] = allowAny
    ? ['*']
    : values.publisherTrustedAlgorithmPublishers ===
        'Allow specific trusted algorithm publishers' &&
      values.publisherTrustedAlgorithmPublishersAddresses
    ? values.publisherTrustedAlgorithmPublishersAddresses
        .split(',')
        .map((addr: string) => addr.trim())
        .filter((addr: string) => addr.length > 0)
    : []

  const privacy: Compute = {
    ...currentOptions,
    publisherTrustedAlgorithms,
    publisherTrustedAlgorithmPublishers
  }
  return privacy
}
