import { useAutomation } from '@context/Automation/AutomationProvider'
import { useMemo } from 'react'
import { Address, useAccount, useProvider, useSigner } from 'wagmi'

export const useAutoSigner = () => {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet, isAutomationEnabled } = useAutomation()
  const wagmiProvider = useProvider()

  const { signerToUse, accountToUse } = useMemo(() => {
    if (isAutomationEnabled && autoWallet) {
      const connected = autoWallet.connect(wagmiProvider)
      return {
        signerToUse: connected,
        accountToUse: autoWallet.address as Address
      }
    }
    return {
      signerToUse: signer,
      accountToUse: address
    }
  }, [isAutomationEnabled, autoWallet, signer, address, wagmiProvider])

  return { signer: signerToUse, accountId: accountToUse }
}
