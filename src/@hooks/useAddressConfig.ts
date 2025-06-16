import { AssetExtended } from 'src/@types/AssetExtended'
import addressConfig from '../../address.config.cjs'
const {
  whitelists,
  featured,
  verifiedWallets
}: {
  whitelists: UseAddressConfig['whitelists']
  featured: UseAddressConfig['featured']
  verifiedWallets: UseAddressConfig['verifiedWallets']
} = addressConfig

export interface UseAddressConfig {
  whitelists: {
    'indexedMetadata.nft.owner': string[]
    'indexedMetadata.stats.datatokenAddress': string[]
  }
  featured: { assets: string[]; title: string }[]
  verifiedWallets: {
    [key: string]: string
  }
  isAddressWhitelisted: (address: string) => boolean
  isDDOWhitelisted: (ddo: AssetExtended) => boolean
  hasFeaturedAssets: () => boolean
  isWhitelistEnabled: () => boolean
}

function isWhitelistEnabled() {
  return (
    Object.values(whitelists).filter((whitelist) => whitelist.length > 0)
      .length > 0
  )
}

function hasFeaturedAssets() {
  return featured?.some((section) => section?.assets?.length > 0)
}

export function useAddressConfig(): UseAddressConfig {
  const isAddressWhitelisted = function (
    address: string,
    field?: keyof UseAddressConfig['whitelists']
  ) {
    if (!isWhitelistEnabled()) return true
    return field
      ? whitelists[field].some(
          (whitelistedAddress) =>
            whitelistedAddress.toLowerCase() === address.toLowerCase()
        )
      : Object.values(whitelists).some((whitelist) =>
          whitelist.some(
            (whitelistedAddress) =>
              whitelistedAddress.toLowerCase() === address.toLowerCase()
          )
        )
  }

  const isDDOWhitelisted = function (ddo: AssetExtended) {
    if (!isWhitelistEnabled()) return true
    return (
      ddo &&
      (isAddressWhitelisted(
        ddo.indexedMetadata.nft.owner,
        'indexedMetadata.nft.owner'
      ) ||
        ddo.indexedMetadata.stats
          .map((stat) => {
            return isAddressWhitelisted(
              stat.datatokenAddress,
              'indexedMetadata.stats.datatokenAddress'
            )
          })
          .some((isWhitelisted) => isWhitelisted === true))
    )
  }

  return {
    whitelists,
    featured,
    verifiedWallets,
    isAddressWhitelisted,
    isDDOWhitelisted,
    hasFeaturedAssets,
    isWhitelistEnabled
  }
}
