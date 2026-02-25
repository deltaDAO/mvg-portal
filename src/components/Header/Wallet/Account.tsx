import { forwardRef, FormEvent, useState, useEffect, useRef } from 'react'
import Caret from '@images/caret.svg'
import { accountTruncate } from '@utils/wallet'
// import Loader from '@shared/atoms/Loader'
import styles from './Account.module.css'
import Avatar from '@shared/atoms/Avatar'
import Button from '@shared/atoms/Button'
import { useAccount } from 'wagmi'
import { useAutomation } from '@context/Automation/AutomationProvider'
import LoginModal from '@components/@shared/LoginModal'
import Login from '@images/login.svg'

// Forward ref for Tippy.js
// eslint-disable-next-line
const Account = forwardRef((props, ref: any) => {
  const { address: accountId } = useAccount()
  const { hasValidEncryptedWallet } = useAutomation()
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)
  const hasAutoShownModal = useRef<boolean>(false)

  // Auto-show login modal when there's a stored wallet but user is not logged in
  useEffect(() => {
    if (hasValidEncryptedWallet && !accountId && !hasAutoShownModal.current) {
      setShowLoginModal(true)
      hasAutoShownModal.current = true
    }
  }, [hasValidEncryptedWallet, accountId])

  async function handleActivation(e: FormEvent) {
    // prevent accidentally submitting a form the button might be in
    e.preventDefault()

    setShowLoginModal(true)
  }

  return (
    <>
      {accountId ? (
        <button
          className={styles.button}
          aria-label="Account"
          ref={ref}
          onClick={(e) => e.preventDefault()}
        >
          <Avatar accountId={accountId} />
          <span className={styles.address} title={accountId}>
            {accountTruncate(accountId)}
          </span>
          <Caret aria-hidden="true" className={styles.caret} />
        </button>
      ) : (
        <Button
          style="primary"
          onClick={(e) => handleActivation(e)}
          className={styles.loginButton}
        >
          <Login aria-hidden="true" />
          Login
        </Button>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
})

export default Account
