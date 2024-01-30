import { Chain } from 'wagmi'
import * as wagmiChains from 'wagmi/chains'

export const getSupportedChains = (chainIdsSupported: number[]): Chain[] => {
  const chains = [wagmiChains].map((chain) => {
    return Object.values(chain).filter((chain) =>
      chainIdsSupported.includes(chain.id)
    )
  })

  return chains.flat()
}
