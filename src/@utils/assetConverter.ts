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
            : true
        }

        algorithmList.push(assetEntry)
      })
    }
  }

  // Sort so that checked = true appear first
  algorithmList.sort((a, b) =>
    b.checked === a.checked ? 0 : b.checked ? 1 : -1
  )

  return algorithmList
}
