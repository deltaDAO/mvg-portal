import { FormEvent, ReactElement, useRef } from 'react'
import Button from '../atoms/Button'
import InputElement from '../FormInput/InputElement'
import Loader from '../atoms/Loader'
import { accountTruncate } from '@utils/wallet'
import styles from './index.module.css'
import Address from '@components/Header/UserPreferences/Automation/Address'
import { useAutomation } from '@context/Automation/AutomationProvider'

interface WalletDecryptFormProps {
  onDecrypt: (password: string) => Promise<boolean>
  onBack: () => void
  isLoading: boolean
}

export default function WalletDecryptForm({
  onDecrypt,
  onBack,
  isLoading
}: WalletDecryptFormProps): ReactElement {
  const { autoWalletAddress } = useAutomation()
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = passwordInputRef.current?.value
    if (password) {
      await onDecrypt(password)
    }
  }

  if (isLoading) {
    return <Loader message="Decrypting..." />
  }

  return (
    <>
      <div>
        {autoWalletAddress && <Address showDelete={false} />}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <InputElement
              name="password"
              placeholder="Password"
              label="Password"
              type="password"
              ref={passwordInputRef}
            />
            <p className={styles.info}>
              Enter the password to decrypt your wallet.
            </p>
          </div>
          <Button type="submit" className={styles.loginOption}>
            Decrypt
          </Button>
        </form>
      </div>

      <Button
        style="text"
        size="small"
        onClick={onBack}
        className={styles.cancel}
      >
        Use different login method
      </Button>
    </>
  )
}
