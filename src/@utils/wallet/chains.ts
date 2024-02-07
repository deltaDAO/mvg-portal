import { Chain } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'
import { networksMetadata } from '../../../networksMetadata.config'

export const additionalChains: Chain[] = networksMetadata.map((metadata) => ({
  id: metadata.chainId,
  name: metadata.name,
  network: metadata.chain,
  nativeCurrency: metadata.nativeCurrency,
  rpcUrls: {
    public: { http: metadata.rpc },
    default: { http: metadata.rpc }
  },
  blockExplorers: {
    default: {
      name: metadata.explorers[0].name,
      url: metadata.explorers[0].url
    }
  }
}))

export const getSupportedChains = (chainIdsSupported: number[]): Chain[] => {
  const wagmiChainsFiltered = [wagmiChains]
    .map((chain) => {
      return Object.values(chain).filter(
        (chain) =>
          chainIdsSupported.includes(chain.id) &&
          // ensure to overwrite custom "additional" chains
          !additionalChains.map((addChain) => addChain.id).includes(chain.id)
      )
    })
    .flat() as Chain[]

  return [...wagmiChainsFiltered, ...additionalChains]
}
