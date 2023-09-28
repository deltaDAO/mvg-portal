import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Button from '../../../@shared/atoms/Button'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Loader from '../../../@shared/atoms/Loader'
import styles from './Import.module.css'
import Input from '../../../@shared/FormInput'
import InputElement from '../../../@shared/FormInput/InputElement'
import { LoggerInstance } from '@oceanprotocol/lib'

export default function Import(): ReactElement {
  const { isLoading, importAutomationWallet } = useAutomation()

  const [showFileInput, setShowFileInput] = useState<boolean>()

  const importToLocalStorage = async (target: EventTarget) => {
    try {
      const file = (target as any).files[0]
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = async (event) => {
        await importAutomationWallet(event.target.result.toString())
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
              importToLocalStorage(e.target)
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
