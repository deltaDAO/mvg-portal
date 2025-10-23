import { PublisherTrustedAlgorithm } from '@oceanprotocol/lib'
import { Consent, PossibleRequests } from '@utils/consents/types'
import { decodeTokenURI, setNFTMetadataAndTokenURI } from '@utils/nft'
import { CancelToken } from 'axios'
import { Signer } from 'ethers'
import { createTrustedAlgorithmList } from './compute'
import { extractDidFromUrl } from './consents/utils'

interface AssetUpdater {
  update(asset: AssetExtended): Promise<void>
}

const RequestTrustedAlgorithmPublisherUpdater = (
  publisherDid: Readonly<NonNullable<string>>
): AssetUpdater => ({
  update: async (asset: AssetExtended) =>
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) =>
        service.compute.publisherTrustedAlgorithmPublishers.push(publisherDid)
      )
})

const RequestTrustedAlgorithmUpdater = (
  algorithmDid: Readonly<NonNullable<string>>,
  newCancelToken: () => CancelToken
): AssetUpdater => ({
  update: async (asset: AssetExtended) => {
    await Promise.all(
      asset.services
        .filter(({ type }) => type === 'compute')
        .map(async (service) => {
          const newAlgorithmList = await createTrustedAlgorithmList(
            [algorithmDid],
            asset.chainId,
            newCancelToken()
          )
          service.compute.publisherTrustedAlgorithms = [
            ...(service.compute.publisherTrustedAlgorithms || []),
            ...newAlgorithmList
          ].filter(
            // Only keep one copy of each algorithm
            (
              algo: PublisherTrustedAlgorithm,
              index: number,
              self: PublisherTrustedAlgorithm[]
            ) => self.findIndex((a) => a.did === algo.did) === index
          )

          return Promise.resolve()
        })
    )
  }
})

const RequestAllowNetworkAccessUpdater = (): AssetUpdater => ({
  update: async (asset: AssetExtended) =>
    asset.services
      .filter(({ type }) => type === 'compute')
      .forEach((service) => (service.compute.allowNetworkAccess = true))
})

export const Updater = (
  consent: Consent,
  newCancelToken: () => CancelToken
) => ({
  get: (permission: keyof PossibleRequests): AssetUpdater =>
    ({
      allow_network_access: RequestAllowNetworkAccessUpdater(),
      trusted_algorithm: RequestTrustedAlgorithmUpdater(
        extractDidFromUrl(consent.algorithm),
        newCancelToken
      ),
      trusted_algorithm_publisher: RequestTrustedAlgorithmPublisherUpdater(
        consent.solicitor.address
      )
    }[permission])
})

export const AssetConsentApplier = (
  consent: Readonly<NonNullable<Consent>>,
  signer: Readonly<NonNullable<Signer>>,
  newCancelToken: () => CancelToken,
  newAbortSignal: () => AbortSignal
) => ({
  apply: async (asset: AssetExtended): Promise<void> => {
    const permitted = Object.keys(consent.response.permitted)
    if (permitted.length === 0) return

    const previousAsset = JSON.stringify(asset)
    await Promise.all(
      permitted
        .filter((key) => consent.response.permitted[key])
        .map((key: keyof PossibleRequests) =>
          Updater(consent, newCancelToken).get(key).update(asset)
        )
    )

    // If the underlying asset did not change, do not update the blockchain
    if (previousAsset === JSON.stringify(asset)) return

    const tx = await setNFTMetadataAndTokenURI(
      asset,
      await signer.getAddress(),
      signer,
      decodeTokenURI(asset.nft.tokenURI),
      newAbortSignal()
    )

    if (!tx || !(await tx.wait()))
      throw new Error('Failed to execute transaction')
  }
})
