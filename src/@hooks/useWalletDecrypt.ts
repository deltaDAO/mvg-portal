import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { useAutomation } from '@context/Automation/AutomationProvider'

export function useWalletDecrypt() {
  const {
    decryptAutomationWallet,
    setIsAutomationEnabled,
    decryptPercentage,
    isLoading
  } = useAutomation()

  const decryptToastRef = useRef(null)

  useEffect(() => {
    if (decryptToastRef.current) {
      toast.update(decryptToastRef.current, { progress: decryptPercentage })
    }
  }, [decryptPercentage])

  const decrypt = async (password: string): Promise<boolean> => {
    if (!password) {
      toast.error('Please provide the password before attempting decryption.')
      return false
    }

    decryptToastRef.current = toast.info('Decrypting Wallet...')

    const success = await decryptAutomationWallet(password)

    if (success) {
      setIsAutomationEnabled(true)
    }

    toast.done(decryptToastRef.current)
    return success
  }

  return { decrypt, isLoading }
}
