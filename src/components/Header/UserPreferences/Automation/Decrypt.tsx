import React, { ReactElement, useEffect, useRef, useState } from 'react'
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

  const decrpytToastRef = useRef(null)
  const passwordInputRef = useRef(null)

  useEffect(() => {
    toast.update(decrpytToastRef.current, { progress: decryptPercentage })
  }, [decrpytToastRef, decryptPercentage])

  return (
    <div className={styles.wrapper}>
      {isLoading ? (
        <Loader message="Decrypting..." />
      ) : (
        <>
          <strong className={styles.warning}>The wallet is locked!</strong>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              decrpytToastRef.current = toast.info(`Decrypting Wallet...`)
              await decryptAutomationWallet(passwordInputRef.current.value)
              setIsAutomationEnabled(true)
              toast.done(decrpytToastRef.current)
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
      )}
    </div>
  )
}
