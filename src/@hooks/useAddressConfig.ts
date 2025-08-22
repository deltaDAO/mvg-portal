import addressConfig from '../../address.config'
const {
  whitelists,
  featured,
  verifiedAddresses
}: {
  whitelists: UseAddressConfig['whitelists']
  featured: UseAddressConfig['featured']
  verifiedAddresses: UseAddressConfig['verifiedAddresses']
} = addressConfig

export interface UseAddressConfig {
  whitelists: {
    'nft.owner': string[]
    'datatokens.address': string[]
  }
  featured: { assets: string[]; title: string }[]
  verifiedAddresses: {
    [key: string]: string
  }
  isAddressWhitelisted: (address: string) => boolean
  isDDOWhitelisted: (ddo: AssetExtended) => boolean
  hasFeaturedAssets: () => boolean
  isWhitelistEnabled: () => boolean
  getVerifiedAddressName: (address: string) => string | undefined
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
      (isAddressWhitelisted(ddo.nft.owner, 'nft.owner') ||
        ddo.datatokens
          .map((datatoken) => {
            return isAddressWhitelisted(datatoken.address, 'datatokens.address')
          })
          .some((isWhitelisted) => isWhitelisted === true))
    )
  }

  const getVerifiedAddressName = (address: string): string | undefined => {
    const addressKey = Object.keys(verifiedAddresses).find(
      (key) => key.toLowerCase() === address.toLowerCase()
    )
    const addressName = verifiedAddresses[addressKey]
    return addressName
  }

  return {
    whitelists,
    featured,
    verifiedAddresses,
    isAddressWhitelisted,
    isDDOWhitelisted,
    hasFeaturedAssets,
    isWhitelistEnabled,
    getVerifiedAddressName
  }
}
