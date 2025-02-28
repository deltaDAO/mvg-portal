import { PublisherTrustedAlgorithm } from '@oceanprotocol/lib'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { getServiceByName, isAddressWhitelisted } from './ddo'
import normalizeUrl from 'normalize-url'
import { getAccessDetails, getAvailablePrice } from './accessDetailsAndPricing'
import { Asset } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'

export async function transformAssetToAssetSelection(
  datasetProviderEndpoint: string,
  assets: Asset[],
  accountId: string,
  selectedAlgorithms?: PublisherTrustedAlgorithm[]
): Promise<AssetSelectionAsset[]> {
  const algorithmList: AssetSelectionAsset[] = []
  if (!assets) return []
  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')

    if (
      asset?.credentialSubject.stats?.price?.value >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      let selected = false
      selectedAlgorithms?.forEach((algorithm: PublisherTrustedAlgorithm) => {
        if (algorithm.did === asset.id) {
          selected = true
        }
      })

      const accessDetails = await Promise.all(
        asset.credentialSubject?.services.map((service: Service) =>
          getAccessDetails(asset.credentialSubject?.chainId, service)
        )
      )
      const price = getAvailablePrice(accessDetails[0])
      const algorithmAsset: AssetSelectionAsset = {
        did: asset.id,
        name: asset.credentialSubject?.metadata.name,
        price: price.value,
        tokenSymbol: price.tokenSymbol,
        checked: selected,
        symbol: asset.credentialSubject?.datatokens[0].symbol,
        isAccountIdWhitelisted: isAddressWhitelisted(asset, accountId, null)
      }
      selected
        ? algorithmList.unshift(algorithmAsset)
        : algorithmList.push(algorithmAsset)
    }
  }
  return algorithmList
}
