import React, { ReactElement, useState } from 'react'
import Button from '../../../@shared/atoms/Button'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Loader from '../../../@shared/atoms/Loader'
import styles from './Import.module.css'
import Input from '../../../@shared/FormInput'
import { LoggerInstance } from '@oceanprotocol/lib'
import { toast } from 'react-toastify'

export default function Import(): ReactElement {
  const { isLoading, importAutomationWallet } = useAutomation()

  const [showFileInput, setShowFileInput] = useState<boolean>()

  const isValidEncryptedWalletJson = (content: string) => {
    try {
      const json = JSON.parse(content)

      if (!json?.address || !json?.id || !json?.version || !json?.crypto)
        return false
    } catch (e) {
      return false
    }
    return true
  }

  const importWalletFromFile = async (target: EventTarget) => {
    try {
      const file = (target as any).files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async (event) => {
        const fileContent = event.target.result.toString()

        if (!isValidEncryptedWalletJson(fileContent)) {
          LoggerInstance.error(
            '[AutomationWalletImport] Could not import file. Invalid content!'
          )
          toast.error(
            'The provided file has unexpected content and cannot be imported.'
          )
          return
        }

        await importAutomationWallet(fileContent)
      }
    } catch (e) {
      LoggerInstance.error(e)
    }
  }

  return (
    <div className={styles.wrapper}>
      {showFileInput ? (
        <>
          <Input
            name="walletJSONFile"
            type="file"
            label="Select file to import"
            onChange={(e) => {
              importWalletFromFile(e.target)
            }}
            className={styles.input}
          />
          <Button
            style="text"
            size="small"
            onClick={() => setShowFileInput(false)}
            className={styles.cancel}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          onClick={() => setShowFileInput(true)}
          disabled={isLoading}
          className={styles.button}
        >
          {isLoading ? <Loader /> : `Import Wallet JSON`}
        </Button>
      )}
    </div>
  )
}
