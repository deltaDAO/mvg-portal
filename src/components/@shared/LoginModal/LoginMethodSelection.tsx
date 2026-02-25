import { ReactElement } from 'react'
import Button from '../atoms/Button'
import styles from './index.module.css'

interface LoginMethodSelectionProps {
  onMetaMaskClick: () => void
  onJsonWalletClick: () => void
}

export default function LoginMethodSelection({
  onMetaMaskClick,
  onJsonWalletClick
}: LoginMethodSelectionProps): ReactElement {
  return (
    <>
      <Button
        style="primary"
        onClick={onJsonWalletClick}
        className={styles.loginOption}
      >
        Import Wallet JSON
      </Button>
      <Button onClick={onMetaMaskClick} className={styles.loginOption}>
        Connect with MetaMask
      </Button>
    </>
  )
}
