import {
  FormEvent,
  FormEventHandler,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react'
import styles from './Decrypt.module.css'
import Button from '../../../@shared/atoms/Button'
import { toast } from 'react-toastify'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Loader from '../../../@shared/atoms/Loader'
import InputElement from '../../../@shared/FormInput/InputElement'

export default function Decrypt(): ReactElement {
  const {
    isLoading,
    decryptPercentage,
    decryptAutomationWallet,
    setIsAutomationEnabled
  } = useAutomation()

  const decryptToastRef = useRef(null)
  const passwordInputRef = useRef(null)

  useEffect(() => {
    toast.update(decryptToastRef.current, { progress: decryptPercentage })
  }, [decryptToastRef, decryptPercentage])

  const initiateDecryption = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!passwordInputRef.current.value) {
      toast.error('Please provide the password before attempting decryption.')
      return
    }
    decryptToastRef.current = toast.info(`Decrypting Wallet...`)
    if (await decryptAutomationWallet(passwordInputRef.current.value))
      setIsAutomationEnabled(true)
    toast.done(decryptToastRef.current)
  }

  return (
    <div className={styles.wrapper}>
      {isLoading ? (
        <Loader message="Decrypting..." />
      ) : (
        <>
          <strong className={styles.warning}>The wallet is locked!</strong>
          <form onSubmit={initiateDecryption} className={styles.form}>
            <InputElement
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
              ref={passwordInputRef}
            />
            <Button type="submit">Decrypt</Button>
          </form>
          <span className={styles.help}>
            Enter the password that was used to encrypt this wallet.
          </span>
        </>
      )}
    </div>
  )
}
