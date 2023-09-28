import React, { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './Decrypt.module.css'
import Button from '../../../@shared/atoms/Button'
import { toast } from 'react-toastify'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Loader from '../../../@shared/atoms/Loader'
import InputElement from '../../../@shared/FormInput/InputElement'
import Input from '../../../@shared/FormInput'
import { Field } from 'formik'

export default function Decrypt(): ReactElement {
  const { isLoading, decryptPercentage, decryptAutomationWallet } =
    useAutomation()

  const decrpytToastRef = useRef(null)
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>()
  const passwordInputRef = useRef(null)

  useEffect(() => {
    toast.update(decrpytToastRef.current, { progress: decryptPercentage })
  }, [decrpytToastRef, decryptPercentage])

  return (
    <div className={styles.wrapper}>
      {isLoading ? (
        <Loader message="Decrypting..." />
      ) : showPasswordInput ? (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              decrpytToastRef.current = toast.info(`Decrypting Wallet...`)
              await decryptAutomationWallet(passwordInputRef.current.value)
              toast.done(decrpytToastRef.current)
              setShowPasswordInput(false)
            }}
            className={styles.form}
          >
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
      ) : (
        <Button
          onClick={() => setShowPasswordInput(true)}
          disabled={isLoading}
          className={styles.button}
        >
          Decrypt Wallet
        </Button>
      )}
    </div>
  )
}
