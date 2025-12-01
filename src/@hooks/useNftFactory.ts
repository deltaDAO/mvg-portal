import { useEffect, useState } from 'react'
import { NftFactory } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useChainId } from 'wagmi'
import { useEthersSigner } from './useEthersSigner'

function useNftFactory(): NftFactory {
  const chainId = useChainId()
  const signer = useEthersSigner()
  const [nftFactory, setNftFactory] = useState<NftFactory>()

  useEffect(() => {
    if (!signer || !chainId) return

    const config = getOceanConfig(chainId)
    const factory = new NftFactory(
      config?.nftFactoryAddress,
      signer as any,
      config.chainId,
      config
    )
    setNftFactory(factory)
  }, [signer, chainId])

  return nftFactory
}

export default useNftFactory
