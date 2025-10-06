import {
  AssetSelectionAsset,
  PublisherTrustedAlgorithmService
} from '@shared/FormInput/InputElement/AssetSelection'
import { getServiceByName, isAddressWhitelisted } from './ddo'
import normalizeUrl from 'normalize-url'
import { Asset } from 'src/@types/Asset'

export async function transformAssetToAssetSelection(
  datasetProviderEndpoint: string,
  assets: Asset[],
  accountId: string,
  selectedAlgorithms?: PublisherTrustedAlgorithmService[],
  allow?: boolean
): Promise<AssetSelectionAsset[]> {
  if (!assets) return []
  const algorithmList: AssetSelectionAsset[] = []
  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')
    if (
      Number(asset.indexedMetadata.stats[0]?.prices[0]?.price) >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      const isAllAlgorithmsAllowed =
        selectedAlgorithms?.some(
          (algo) =>
            algo.did === '*' &&
            algo.containerSectionChecksum === '*' &&
            algo.filesChecksum === '*' &&
            algo.serviceId === '*'
        ) ?? false

      const matches = new Set(
        selectedAlgorithms?.map((a) => `${a.did}|${a.serviceId}`)
      )

      const { services } = asset.credentialSubject
      // only loop through services that are compute, match provider, and appear in selectedAlgorithms
      services.forEach((service, idx) => {
        // enforce compute-only
        if (service?.type !== 'compute') return
        // enforce same provider as datasetProviderEndpoint
        if (
          normalizeUrl(service?.serviceEndpoint) !==
          normalizeUrl(datasetProviderEndpoint)
        )
          return
        const key = `${asset.id}|${service.id}`
        if (
          selectedAlgorithms &&
          selectedAlgorithms.length > 0 &&
          !isAllAlgorithmsAllowed &&
          !matches.has(key)
        )
          return // <-- skip any service that wasn't in selectedAlgorithms
        const assetEntry: AssetSelectionAsset = {
          did: asset.id,
          serviceId: service.id,
          serviceName: service.name,
          name: asset.credentialSubject.metadata.name,
          price:
            Number(asset.indexedMetadata.stats[idx]?.prices[0]?.price) ?? 0,
          tokenSymbol: 'OCEAN',
          checked: false,
          symbol: asset.indexedMetadata.stats[idx]?.symbol ?? '',
          isAccountIdWhitelisted: !allow
            ? isAddressWhitelisted(asset, accountId, service)
            : true,
          datetime: asset.indexedMetadata.event.datetime
        }
        // put selected ones up front
        algorithmList.unshift(assetEntry)
      })
    }
  }
  algorithmList.sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  })
  return algorithmList
}

export async function transformAssetToAssetSelectionDataset(
  datasetProviderEndpoint: string,
  assets: Asset[],
  accountId: string,
  selectedAlgorithms?: PublisherTrustedAlgorithmService[],
  allow?: boolean,
  allowedAlgorithm?: { algorithmDid: string; algorithmServiceId: string }
): Promise<any[]> {
  if (!assets) return []
  const algorithmList: any[] = []
  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')
    if (
      Number(asset.indexedMetadata.stats[0]?.prices[0]?.price) >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      const isAllAlgorithmsAllowed =
        selectedAlgorithms?.some(
          (algo) =>
            algo.did === '*' &&
            algo.containerSectionChecksum === '*' &&
            algo.filesChecksum === '*' &&
            algo.serviceId === '*'
        ) ?? false

      const matches = new Set(
        selectedAlgorithms?.map((a) => `${a.did}|${a.serviceId}`)
      )

      const { services } = asset.credentialSubject
      // only loop through services that are compute, same provider, and allowed for the selected algorithm
      services.forEach((service, idx) => {
        // keep only compute services
        if (service?.type !== 'compute') return
        // enforce same provider as datasetProviderEndpoint
        if (
          normalizeUrl(service?.serviceEndpoint) !==
          normalizeUrl(datasetProviderEndpoint)
        )
          return

        if (allowedAlgorithm) {
          const computeSection = (service as any)?.compute
          const publishers = computeSection?.publisherTrustedAlgorithmPublishers
          const algos = computeSection?.publisherTrustedAlgorithms

          const allowsAllByPublishers = Array.isArray(publishers)
            ? publishers.includes('*')
            : false
          let allowsAllByWildcardAlgo = false
          if (Array.isArray(algos) && algos.length === 1) {
            const a = algos[0]
            allowsAllByWildcardAlgo =
              a?.did === '*' &&
              a?.containerSectionChecksum === '*' &&
              a?.filesChecksum === '*' &&
              a?.serviceId === '*'
          }
          const allowsSpecific = Array.isArray(algos)
            ? algos.some(
                (a: any) =>
                  a?.did === allowedAlgorithm.algorithmDid &&
                  (a?.serviceId === allowedAlgorithm.algorithmServiceId ||
                    a?.serviceId === '*')
              )
            : false

          if (
            !allowsAllByPublishers &&
            !allowsAllByWildcardAlgo &&
            !allowsSpecific
          )
            return
        }

        const key = `${asset.id}|${service.id}`
        if (
          selectedAlgorithms &&
          selectedAlgorithms.length > 0 &&
          !isAllAlgorithmsAllowed &&
          !matches.has(key)
        )
          return // <-- skip any service that wasn't in selectedAlgorithms
        const assetEntry: any = {
          did: asset.id,
          description:
            asset.credentialSubject.metadata.description?.['@value'] || '',
          serviceId: service.id,
          serviceName: service.name,
          serviceDescription: service.description?.['@value'] || '',
          serviceType: service.type,
          serviceDuration: service.timeout,
          name: asset.credentialSubject.metadata.name,
          price:
            Number(asset.indexedMetadata.stats[idx]?.prices[0]?.price) ?? 0,
          tokenSymbol: 'OCEAN',
          checked: false,
          symbol: asset.indexedMetadata.stats[idx]?.symbol ?? '',
          isAccountIdWhitelisted: !allow
            ? isAddressWhitelisted(asset, accountId, service)
            : true,
          datetime: asset.indexedMetadata.event.datetime
        }
        // put selected ones up front
        algorithmList.unshift(assetEntry)
      })
    }
  }
  algorithmList.sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  })
  return algorithmList
}
// list of datasets
// need to bring services to corresponding dataset

export async function transformAssetToAssetSelectionEdit(
  datasetProviderEndpoint: string,
  assets: Asset[],
  accountId: string,
  selectedAlgorithms?: PublisherTrustedAlgorithmService[],
  allow?: boolean
): Promise<AssetSelectionAsset[]> {
  if (!assets) return []

  const algorithmList: AssetSelectionAsset[] = []
  const isAllAlgorithmsAllowed =
    selectedAlgorithms?.some(
      (algo) =>
        algo.did === '*' &&
        algo.containerSectionChecksum === '*' &&
        algo.filesChecksum === '*' &&
        algo.serviceId === '*'
    ) ?? false

  const matches = new Set(
    selectedAlgorithms?.map((a) => `${a.did}|${a.serviceId}`)
  )

  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')

    if (
      Number(asset.indexedMetadata.stats[0]?.prices[0]?.price) >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      const { services } = asset.credentialSubject

      services.forEach((service, idx) => {
        const key = `${asset.id}|${service.id}`

        const assetEntry: AssetSelectionAsset = {
          did: asset.id,
          serviceId: service.id,
          serviceName: service.name,
          name: asset.credentialSubject.metadata.name,
          price:
            Number(asset.indexedMetadata.stats[idx]?.prices[0]?.price) ?? 0,
          tokenSymbol: 'OCEAN',
          checked: !!(isAllAlgorithmsAllowed || matches.has(key)),
          symbol: asset.indexedMetadata.stats[idx]?.symbol ?? '',
          isAccountIdWhitelisted: !allow
            ? isAddressWhitelisted(asset, accountId, service)
            : true,
          datetime: asset.indexedMetadata.event.datetime
        }

        algorithmList.push(assetEntry)
      })
    }
  }

  // Sort: selected first; both selected and unselected are sorted by datetime (newest first)
  algorithmList.sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? -1 : 1
    const aTime = a.datetime ? new Date(a.datetime).getTime() : 0
    const bTime = b.datetime ? new Date(b.datetime).getTime() : 0
    return bTime - aTime
  })

  return algorithmList
}

export async function transformAssetToAssetSelectionForComputeWizard(
  datasetProviderEndpoint: string,
  assets: Asset[],
  accountId: string,
  selectedAlgorithms?: PublisherTrustedAlgorithmService[],
  allow?: boolean
): Promise<AssetSelectionAsset[]> {
  if (!assets) return []
  const algorithmList: AssetSelectionAsset[] = []
  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')
    if (
      Number(asset.indexedMetadata.stats[0]?.prices[0]?.price) >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      const isAllAlgorithmsAllowed =
        selectedAlgorithms?.some(
          (algo) =>
            algo.did === '*' &&
            algo.containerSectionChecksum === '*' &&
            algo.filesChecksum === '*' &&
            algo.serviceId === '*'
        ) ?? false

      const matches = new Set(
        selectedAlgorithms?.map((a) => `${a.did}|${a.serviceId}`)
      )

      const { services } = asset.credentialSubject
      // only loop through those services that appear in selectedAlgorithms
      services.forEach((service, idx) => {
        const key = `${asset.id}|${service.id}`
        if (
          selectedAlgorithms &&
          selectedAlgorithms.length > 0 &&
          !isAllAlgorithmsAllowed &&
          !matches.has(key)
        )
          return // <-- skip any service that wasn't in selectedAlgorithms
        const assetEntry: AssetSelectionAsset = {
          did: asset.id,
          serviceId: service.id,
          serviceName: service.name,
          name: asset.credentialSubject.metadata.name,
          price:
            Number(asset.indexedMetadata.stats[idx]?.prices[0]?.price) ?? 0,
          tokenSymbol: 'OCEAN',
          checked: false,
          symbol: asset.indexedMetadata.stats[idx]?.symbol ?? '',
          isAccountIdWhitelisted: !allow
            ? isAddressWhitelisted(asset, accountId, service)
            : true,
          datetime: asset.indexedMetadata.event.datetime
        }
        // put selected ones up front
        algorithmList.unshift(assetEntry)
      })
    }
  }
  algorithmList.sort((a, b) => {
    return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
  })
  return algorithmList
}
