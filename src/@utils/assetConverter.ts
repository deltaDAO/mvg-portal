import {
  AssetSelectionAsset,
  PublisherTrustedAlgorithmService
} from '@shared/FormInput/InputElement/AssetSelection'
import { getServiceByName, isAddressWhitelisted } from './ddo'
import normalizeUrl from 'normalize-url'
import { getAccessDetails, getAvailablePrice } from './accessDetailsAndPricing'
import { Asset } from 'src/@types/Asset'
import axios from 'axios'

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

      // fetch all accessDetails in one go
      const cancelTokenSource = axios.CancelToken.source()
      const { services } = asset.credentialSubject
      const accessDetails = await Promise.all(
        services.map((s) =>
          getAccessDetails(
            asset.credentialSubject.chainId,
            s,
            accountId,
            cancelTokenSource.token
          )
        )
      )

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

        const priceInfo = getAvailablePrice(accessDetails[idx])
        const assetEntry: AssetSelectionAsset = {
          did: asset.id,
          serviceId: service.id,
          serviceName: service.name,
          name: asset.credentialSubject.metadata.name,
          price: priceInfo.value,
          tokenSymbol: priceInfo.tokenSymbol,
          checked: false,
          symbol: asset.indexedMetadata.stats[idx]?.symbol ?? '',
          isAccountIdWhitelisted: !allow
            ? isAddressWhitelisted(asset, accountId, service)
            : true
        }
        // put selected ones up front
        algorithmList.unshift(assetEntry)
      })
    }
  }

  return algorithmList
}
