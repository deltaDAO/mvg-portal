import { useEffect, useState } from 'react'
import { NftFactory } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useChainId, useWalletClient } from 'wagmi'

function useNftFactory(): NftFactory {
  const chainId = useChainId()
  const { data: walletClient } = useWalletClient()
  const [nftFactory, setNftFactory] = useState<NftFactory>()

  useEffect(() => {
    if (!walletClient || !chainId) return

    const config = getOceanConfig(chainId)
    const factory = new NftFactory(
      config?.nftFactoryAddress,
      walletClient as any,
      config.chainId,
      config
    )
    setNftFactory(factory)
  }, [walletClient, chainId])

  return nftFactory
}

export default useNftFactory
