import { LoggerInstance, NftFactory } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useEffect, useState } from 'react'
import { useNetwork, useSigner } from 'wagmi'
import { useAutomation } from '../@context/Automation/AutomationProvider'

function useNftFactory(): NftFactory {
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const { autoWallet, isAutomationEnabled } = useAutomation()
  const [signerToUse, setSignerToUse] = useState(signer)
  const [nftFactory, setNftFactory] = useState<NftFactory>()

  useEffect(() => {
    if (isAutomationEnabled && autoWallet?.address) {
      setSignerToUse(autoWallet)
    } else {
      setSignerToUse(signer)
    }
  }, [isAutomationEnabled, autoWallet, signer])

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
