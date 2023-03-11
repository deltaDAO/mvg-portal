import addressConfig from '../../address.config'
const {
  whitelists,
  featured
}: {
  whitelists: UseAddressConfig['whitelists']
  featured: UseAddressConfig['featured']
} = addressConfig

export interface UseAddressConfig {
  whitelists: {
    'nft.owner': string[]
    'datatokens.address': string[]
  }
  featured: { assets: string[]; title: string }[]
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
          (whitelistedAddress) => whitelistedAddress === address
        )
      : Object.values(whitelists).some((whitelist) =>
          whitelist.some((whitelistedAddress) => whitelistedAddress === address)
        )
  }

  const isDDOWhitelisted = function (ddo: AssetExtended) {
    if (!isWhitelistEnabled()) return true
    return (
      ddo &&
      (isAddressWhitelisted(ddo.nft.owner, 'nft.owner') ||
        ddo.datatokens
          .map((datatoken) => {
            return isAddressWhitelisted(datatoken.address, 'datatokens.address')
          })
          .some((isWhitelisted) => isWhitelisted === true))
    )
  }

  return {
    whitelists,
    featured,
    isAddressWhitelisted,
    isDDOWhitelisted,
    hasFeaturedAssets,
    isWhitelistEnabled
  }
}
