import { FormEvent, ReactElement, useRef } from 'react'
import Button from '../atoms/Button'
import InputElement from '../FormInput/InputElement'
import Loader from '../atoms/Loader'
import styles from './index.module.css'

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
      <p className={styles.info}>Enter the password to decrypt your wallet.</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <InputElement
          name="password"
          placeholder="Password"
          label="Password"
          type="password"
          ref={passwordInputRef}
        />
        <Button type="submit" className={styles.loginOption}>
          Decrypt
        </Button>
      </form>
      <Button
        style="text"
        size="small"
        onClick={onBack}
        className={styles.cancel}
      >
        Back
      </Button>
    </>
  )
}
