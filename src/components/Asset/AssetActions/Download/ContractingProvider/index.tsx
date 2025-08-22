import { ReactElement, useCallback, useEffect, useState } from 'react'
import styles from './index.module.css'
import Button from '../../../../@shared/atoms/Button'
import { useAccount, useSignMessage } from 'wagmi'
import { getContractingProviderNonce, getPayPerUseCount } from '../../utils'
import Alert from '../../../../@shared/atoms/Alert'
import { useMarketMetadata } from '../../../../../@context/MarketMetadata'
import { useAutomation } from '../../../../../@context/Automation/AutomationProvider'

export enum PAYMENT_MODES {
  SUBSCRIPTION = 'subscription',
  PAYPERUSE = 'payperuse'
}

export type PaymentMode = `${PAYMENT_MODES}`

export default function ContractingProvider(props: {
  did: string
}): ReactElement {
  const { did } = props
  const { address } = useAccount()
  const [isRequesting, setIsRequesting] = useState(false)
  const [accessCreditsCount, setAccessCreditsCount] = useState<number>()
  const {
    signMessage,
    data: signMessageData,
    isSuccess,
    isError
  } = useSignMessage()
  const {
    appConfig: {
      contractingProvider: { endpoint: contractingProviderEndpoint }
    }
  } = useMarketMetadata()

  const { autoWallet, isAutomationEnabled } = useAutomation()

  const [activeAddress, setActiveAddress] = useState<string>()
  const [signature, setSignature] = useState<string>()

  useEffect(() => {
    if (isAutomationEnabled) setActiveAddress(autoWallet.address)
    else setActiveAddress(address)
  }, [address, autoWallet?.address, isAutomationEnabled])

  const checkAccessCredits = async () => {
    setIsRequesting(true)

    const nonce = await getContractingProviderNonce(
      contractingProviderEndpoint,
      activeAddress
    )
    if (isAutomationEnabled) {
      try {
        const autoWalletSignature = await autoWallet.signMessage(nonce)
        setSignature(autoWalletSignature)
      } catch (e) {
        setIsRequesting(false)
        console.error(e)
      }
    } else {
      signMessage({ message: nonce })
    }
  }

  const updateCount = useCallback(async () => {
    const count = await getPayPerUseCount(
      contractingProviderEndpoint,
      activeAddress,
      signature,
      did
    )
    setAccessCreditsCount(count)
    setIsRequesting(false)
  }, [contractingProviderEndpoint, activeAddress, signature, did])

  useEffect(() => {
    if (isError) setIsRequesting(false)
    if (isSuccess) {
      setSignature(signMessageData)
    }
  }, [isSuccess, isError])

  useEffect(() => {
    if (!signature) return
    updateCount()
  }, [signature])

  return (
    <div className={styles.container}>
      {accessCreditsCount ? (
        <Alert
          state="info"
          text={`You purchased access to this service **${accessCreditsCount} time${
            accessCreditsCount > 1 ? 's' : ''
          }**`}
          action={{
            name: 'Re-run',
            handleAction: (e) => {
              setAccessCreditsCount(undefined) // force visible re-render
              e.preventDefault()
              checkAccessCredits()
            }
          }}
        />
      ) : (
        <Button
          style="text"
          onClick={(e) => {
            e.preventDefault()
            checkAccessCredits()
          }}
          disabled={isRequesting}
        >
          Check Access Credits
        </Button>
      )}
      <div className={styles.help}>
        You can validate your purchase count of this SaaS Offering against a
        contracting provider instance.
      </div>
    </div>
  )
}
