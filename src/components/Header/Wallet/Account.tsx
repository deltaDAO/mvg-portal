import { forwardRef, useEffect, useState } from 'react'
import Caret from '@images/caret.svg'
import { accountTruncate } from '@utils/wallet'
import styles from './Account.module.css'
import Avatar from '@shared/atoms/Avatar'
import { useAccount, useSigner } from 'wagmi'
import { useModal } from 'connectkit'
import { useSsiWallet } from '@context/SsiWallet'
import {
  connectToWallet,
  setSsiWalletApiOverride,
  STORAGE_KEY
} from '@utils/wallet/ssiWallet'
import { LoggerInstance } from '@oceanprotocol/lib'
import appConfig from 'app.config.cjs'
import SsiApiModal from './SsiApiModal'

const Account = forwardRef((props, ref: any) => {
  const { address: accountId, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const { setOpen } = useModal()
  const { sessionToken, setSessionToken } = useSsiWallet()

  const [showInput, setShowInput] = useState(false)
  const [overrideApi, setOverrideApi] = useState(appConfig.ssiWalletApi)

  useEffect(() => {
    const storedApi = sessionStorage.getItem(STORAGE_KEY)

    if (isConnected && signer && appConfig.ssiEnabled && !sessionToken) {
      if (storedApi) {
        console.log('here')
        connectToWallet(signer)
          .then((session) => {
            setSessionToken(session)
          })
          .catch((error) => LoggerInstance.error(error))
      } else {
        setShowInput(true)
      }
    }
  }, [isConnected, signer, sessionToken, setSessionToken])

  async function handleActivation() {
    setOpen(true)
  }

  async function handleSsiConnect() {
    try {
      setSsiWalletApiOverride(overrideApi)
      const session = await connectToWallet(signer!)
      setSessionToken(session)
      setShowInput(false)
    } catch (error) {
      LoggerInstance.error(error)
    }
  }

  return (
    <>
      <div className={styles.wrapper}>
        {accountId ? (
          <button
            className={`${styles.button}`}
            aria-label="Account"
            ref={ref}
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            <Avatar accountId={accountId} />
            <span className={styles.address} title={accountId}>
              {accountTruncate(accountId)}
            </span>
            <Caret aria-hidden="true" className={styles.caret} />
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.initial}`}
            onClick={handleActivation}
            ref={ref}
          >
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
      {showInput && (
        <SsiApiModal
          apiValue={overrideApi}
          onChange={setOverrideApi}
          onConnect={handleSsiConnect}
        />
      )}
    </>
  )
})

export default Account

Account.displayName = 'Account'
