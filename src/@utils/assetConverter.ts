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
  selectedAlgorithms?: PublisherTrustedAlgorithmService[]
): Promise<AssetSelectionAsset[]> {
  if (!assets) return []

  const algorithmList: AssetSelectionAsset[] = []

  // Iterate over every asset…
  for (const asset of assets) {
    const algoService =
      getServiceByName(asset, 'compute') || getServiceByName(asset, 'access')

    if (
      asset.credentialSubject.stats?.price?.value >= 0 &&
      normalizeUrl(algoService?.serviceEndpoint) ===
        normalizeUrl(datasetProviderEndpoint)
    ) {
      const isSelected = selectedAlgorithms?.some((alg) => alg.did === asset.id)

      const cancelTokenSource = axios.CancelToken.source()
      const { services } = asset.credentialSubject
      const accessDetails = await Promise.all(
        services.map((service) =>
          getAccessDetails(
            asset.credentialSubject.chainId,
            service,
            accountId,
            cancelTokenSource.token
          )
        )
      )

      services.forEach((service, idx) => {
        const priceInfo = getAvailablePrice(accessDetails[idx])
        const assetEntry: AssetSelectionAsset = {
          did: asset.id,
          serviceId: service.id,
          serviceName: service.name,
          name: asset.credentialSubject.metadata.name,
          price: priceInfo.value,
          tokenSymbol: priceInfo.tokenSymbol,
          checked: isSelected ?? false,
          symbol: asset.credentialSubject.datatokens[idx]?.symbol ?? '',
          isAccountIdWhitelisted: isAddressWhitelisted(
            asset,
            accountId,
            service
          )
        }

        if (isSelected) algorithmList.unshift(assetEntry)
        else algorithmList.push(assetEntry)
      })
    }
  }
  return algorithmList
}
