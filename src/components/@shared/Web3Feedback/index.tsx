import { ReactElement, useEffect, useState } from 'react'
import Status from '@shared/atoms/Status'
import styles from './index.module.css'
import WalletNetworkSwitcher from '../WalletNetworkSwitcher'
import Warning from '@images/warning.svg'
import { useModal } from 'connectkit'
import { useAccount, useSigner } from 'wagmi'
import { useSsiWallet } from '@context/SsiWallet'
import {
  connectToWallet,
  setSsiWalletApiOverride,
  STORAGE_KEY
} from '@utils/wallet/ssiWallet'
import appConfig from 'app.config.cjs'
import SsiApiModal from '../../Header/Wallet/SsiApiModal'
import { LoggerInstance } from '@oceanprotocol/lib'

export declare type Web3Error = {
  status: 'error' | 'warning' | 'success'
  title: string
  message?: string
}

export default function Web3Feedback({
  networkId,
  accountId,
  isAssetNetwork
}: {
  networkId: number
  accountId: string
  isAssetNetwork?: boolean
}): ReactElement {
  const [state, setState] = useState<string>()
  const [title, setTitle] = useState<string>()
  const [message, setMessage] = useState<string>()
  const [showFeedback, setShowFeedback] = useState<boolean>(false)

  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()
  const { setOpen } = useModal()
  const { sessionToken, setSessionToken } = useSsiWallet()

  const [showInput, setShowInput] = useState(false)
  const [overrideApi, setOverrideApi] = useState(appConfig.ssiWalletApi)

  useEffect(() => {
    const storedApi = sessionStorage.getItem(STORAGE_KEY)

    if (isConnected && signer && appConfig.ssiEnabled && !sessionToken) {
      if (storedApi) {
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

  function handleConnectWallet() {
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

  useEffect(() => {
    setShowFeedback(!accountId || isAssetNetwork === false)
    if (accountId && isAssetNetwork) return
    if (!accountId) {
      setState('error')
      setTitle('No account connected')
      setMessage('Please connect your wallet.')
    } else if (isAssetNetwork === false) {
      setState('error')
      setTitle('Not connected to asset network')
      setMessage('Please connect your wallet.')
    } else {
      setState('warning')
      setTitle('Something went wrong.')
      setMessage('Something went wrong.')
    }
  }, [accountId, isAssetNetwork])

  return (
    <>
      {showFeedback && (
        <section className={styles.feedback}>
          <Status state={state} aria-hidden />
          <div className={styles.warningImage}>
            <Warning />
          </div>
          <h3 className={styles.title}>{title}</h3>
          {isAssetNetwork === false ? (
            <WalletNetworkSwitcher />
          ) : (
            message && (
              <span className={styles.error} onClick={handleConnectWallet}>
                {message}
              </span>
            )
          )}
        </section>
      )}

      {showInput && (
        <SsiApiModal
          apiValue={overrideApi}
          onChange={setOverrideApi}
          onConnect={handleSsiConnect}
        />
      )}
    </>
  )
}
