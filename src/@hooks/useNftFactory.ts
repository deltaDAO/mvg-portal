import { LoggerInstance, NftFactory } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { useAutomation } from '../@context/Automation/AutomationProvider'
import { getEthersSigner } from '@utils/getEthersSigner'

function useNftFactory(): NftFactory {
  const { chain } = useAccount()
  const { data: signer } = useWalletClient()
  const { autoWallet, isAutomationEnabled } = useAutomation()
  const [signerToUse, setSignerToUse] = useState(
    getEthersSigner({ client: signer, chainId: chain?.id })
  )
  const [nftFactory, setNftFactory] = useState<NftFactory>()

  useEffect(() => {
    if (isAutomationEnabled && autoWallet?.address) {
      setSignerToUse(autoWallet)
    } else {
      setSignerToUse(getEthersSigner({ client: signer, chainId: chain?.id }))
    }
  }, [isAutomationEnabled, autoWallet, signer, chain?.id])

  useEffect(() => {
    if (!signerToUse || !chain?.id) return

    const config = getOceanConfig(chain.id)
    const factory = new NftFactory(config?.nftFactoryAddress, signerToUse)
    LoggerInstance.log('[NftFactory] instantiated:', {
      chain: chain.id,
      factory: factory.address,
      signer: signerToUse
    })
    setNftFactory(factory)
  }, [signerToUse, chain?.id])

  return nftFactory
}

export default useNftFactory
