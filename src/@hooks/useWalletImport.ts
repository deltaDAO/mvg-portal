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

      await new Promise<void>((resolve, reject) => {
        reader.onload = async (event) => {
          try {
            const fileContent = event.target?.result?.toString()

            if (!fileContent || !isValidEncryptedWalletJson(fileContent)) {
              LoggerInstance.error(
                '[WalletImport] Could not import file. Invalid content!'
              )
              toast.error(
                'The provided file has unexpected content and cannot be imported.'
              )
              resolve()
              return
            }

            const imported = await importAutomationWallet(fileContent)

            if (imported) {
              onSuccess()
            } else {
              LoggerInstance.error(
                '[WalletImport] Could not import wallet. importAutomationWallet returned false.'
              )
              toast.error('Failed to import wallet from the provided file.')
            }
            resolve()
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = (event) => {
          const error =
            (event.target && (event.target as FileReader).error) ||
            new Error('Failed to read wallet file.')
          reject(error)
        }

        reader.readAsText(file)
      })
    } catch (e) {
      LoggerInstance.error('[WalletImport]', e)
      toast.error('Failed to import wallet file.')
    }
  }

  return { importFromFile }
}
