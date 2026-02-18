import { LoggerInstance } from '@oceanprotocol/lib'
import { toast } from 'react-toastify'
import { useAutomation } from '@context/Automation/AutomationProvider'
import { isValidEncryptedWalletJson } from '@utils/wallet/validateWalletJson'

export function useWalletImport() {
  const { importAutomationWallet } = useAutomation()

  const importFromFile = async (
    target: EventTarget,
    onSuccess: () => void
  ): Promise<void> => {
    try {
      const file = (target as HTMLInputElement).files?.[0]

      if (!file) return

      const reader = new FileReader()

      reader.onload = async (event) => {
        const fileContent = event.target?.result?.toString()

        if (!fileContent || !isValidEncryptedWalletJson(fileContent)) {
          LoggerInstance.error(
            '[WalletImport] Could not import file. Invalid content!'
          )
          toast.error(
            'The provided file has unexpected content and cannot be imported.'
          )
          return
        }

        await importAutomationWallet(fileContent)
        onSuccess()
      }

      reader.readAsText(file)
    } catch (e) {
      LoggerInstance.error('[WalletImport]', e)
      toast.error('Failed to import wallet file.')
    }
  }

  return { importFromFile }
}
