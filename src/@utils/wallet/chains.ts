import { Chain } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'

// Custom OP Sepolia chain
export const opSepolia: Chain = {
  id: 11155420,
  name: 'OP Sepolia',
  network: 'op-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.dev.pontus-x.eu'] },
    public: { http: ['https://rpc.dev.pontus-x.eu'] }
  },
  blockExplorers: {
    default: {
      name: 'PontusX Explorer',
      url: 'https://explorer.pontus-x.eu/devnet/pontusx'
    }
  },
  testnet: true
}

// Custom Ethereum Hoodi testnet
export const ethereumHoodi: Chain = {
  id: 560048,
  name: 'Ethereum Hoodi',
  network: 'hoodi',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.hoodi.ethpandaops.io'] },
    public: { http: ['https://rpc.hoodi.ethpandaops.io'] }
  },
  blockExplorers: {
    default: {
      name: 'Hoodi Explorer',
      url: 'https://hoodi.etherscan.io'
    }
  },
  testnet: true
}

/**
 * Returns wagmi-compatible chains filtered by allowed chain IDs
 */
export const getSupportedChains = (chainIdsSupported: number[]): Chain[] => {
  // Convert wagmiChains module to array of Chain objects
  const baseChains: Chain[] = Object.values(wagmiChains)

  // Include custom chains
  const allChains = [...baseChains, opSepolia, ethereumHoodi]

  // Filter chains by allowed IDs
  const filteredChains = allChains.filter((chain) =>
    chainIdsSupported.includes(chain.id)
  )

  // Override RPC URL if env var is set (for dev/test)
  return filteredChains.map((chain) => {
    if (
      (chain.id === 11155111 || chain.id === 11155420) &&
      process.env.NEXT_PUBLIC_NODE_URI
    ) {
      return {
        ...chain,
        rpcUrls: {
          public: { http: [process.env.NEXT_PUBLIC_NODE_URI] },
          default: { http: [process.env.NEXT_PUBLIC_NODE_URI] }
        }
      }
    }
    return chain
  })
}
