import { Chain } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'

export const genx = {
  id: 100,
  name: 'GEN-X Testnet',
  network: 'genx',
  nativeCurrency: {
    decimals: 18,
    name: 'GX',
    symbol: 'GX'
  },
  rpcUrls: {
    public: { http: ['https://rpc.genx.minimal-gaia-x.eu'] },
    default: { http: ['https://rpc.genx.minimal-gaia-x.eu'] }
  },
  blockExplorers: {
    default: {
      name: 'GEN-X Testnet Explorer',
      url: 'https://explorer.genx.minimal-gaia-x.eu'
    }
  }
} as Chain

export const getSupportedChains = (chainIdsSupported: number[]): Chain[] => {
  const chains = [wagmiChains, genx].map((chain) => {
    return Object.values(chain).filter((chain) =>
      chainIdsSupported.includes(chain.id)
    )
  })

  return chains.flat()
}
