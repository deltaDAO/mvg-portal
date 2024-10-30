import Alert from '@components/@shared/atoms/Alert'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import { LoggerInstance } from '@oceanprotocol/lib'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useNetwork, useSignMessage } from 'wagmi'
import content from '../../../content/pages/faucet.json'
import { getMessage, requestTokens } from '../../@utils/faucet'
import styles from './index.module.css'
import NetworkName from '../@shared/NetworkName'

interface Content {
  title: string
  description: string
  buttonLabel: string
  card: {
    cardTitle: string
    cardDescription: string
    cardExplainerTitle: string
    cardExplainerFirstStep: string
    cardExplainerSecondStep: string
    cardExplainerThirdStep: string
    cardExplainerFourthStep: string
    cardExplainerFithStep: string
    cardNetworkAddress: string
    cardNetwork: string
  }
}

const FaucetPage = (): ReactElement => {
  const { buttonLabel }: Content = content
  const { card }: Content = content
  const {
    cardTitle,
    cardDescription,
    cardExplainerTitle,
    cardExplainerFirstStep,
    cardExplainerSecondStep,
    cardExplainerThirdStep,
    cardExplainerFourthStep,
    cardExplainerFithStep,
    cardNetworkAddress,
    cardNetwork
  } = card

  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingTokens, setIsRequestingTokens] = useState(false)
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const { address: accountAddress } = useAccount()
  const { chain } = useNetwork()

  const {
    data: signMessageData,
    error: signMessageError,
    isLoading: signMessageLoading,
    isSuccess: signMessageSuccess,
    signMessage
  } = useSignMessage()

  const handleVerify = useCallback(async () => {
    setIsLoading(true)
    setError(undefined)
    setMessage(undefined)

    try {
      const message = await getMessage(accountAddress)
      signMessage({ message })
    } catch (error) {
      LoggerInstance.error(error)
      setError(error.message || 'Error generating message.')
    } finally {
      setIsLoading(false)
    }
  }, [accountAddress, signMessage])

  const handleSearchStart = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      handleVerify()
    },
    [handleVerify]
  )

  const faucetTokenRequest = useCallback(async () => {
    setIsRequestingTokens(true)
    try {
      const hashes = await requestTokens(accountAddress, signMessageData)
      toast.success(`Successfully requested test tokens: ${hashes.join(', ')}`)
      setMessage(
        'Tokens successfully requested. It can take up to 30 seconds until tokens show up in your wallet.'
      )
    } catch (error) {
      const errorMessage =
        error.message || 'Unable to request tokens. Please try again later.'
      setError(errorMessage)
      LoggerInstance.error('[Onboarding] Error requesting tokens', error)
    } finally {
      setIsRequestingTokens(false)
    }
  }, [accountAddress, signMessageData])

  useEffect(() => {
    if (signMessageLoading) return

    if (signMessageError) {
      toast.error('Unable to sign message. Please try again.')
      LoggerInstance.error(
        '[Onboarding] Error signing message',
        signMessageError
      )
      return
    }

    if (signMessageSuccess && signMessageData) {
      faucetTokenRequest()
    }
  }, [
    signMessageSuccess,
    signMessageData,
    signMessageError,
    signMessageLoading,
    faucetTokenRequest
  ])

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{cardTitle}</h2>
      <p className={styles.description}>{cardDescription}</p>
      <div className={styles.instructions}>
        <h3>{cardExplainerTitle}</h3>
        <ol>
          <li>{cardExplainerFirstStep}</li>
          <li>{cardExplainerSecondStep}</li>
          <li>{cardExplainerThirdStep}</li>
          <li>{cardExplainerFourthStep}</li>
          <li>{cardExplainerFithStep}</li>
        </ol>
      </div>
      <div className={styles.address}>
        <strong>{cardNetworkAddress}:</strong> {accountAddress}
      </div>
      <div className={styles.network}>
        <strong>{cardNetwork}:</strong> <NetworkName networkId={chain?.id} />
      </div>
      <form className={styles.form} onSubmit={handleSearchStart}>
        <Button
          disabled={!accountAddress || isLoading || isRequestingTokens}
          style="primary"
          size="small"
          type="submit"
          className={
            isLoading || isRequestingTokens ? styles.disabledButton : ''
          }
        >
          {isLoading || isRequestingTokens ? <Loader /> : buttonLabel}
        </Button>
      </form>
      {!isLoading && error && (
        <div className={styles.errorContainer}>
          <Alert title="Error" text={error} state="error" />
        </div>
      )}
      {!isLoading && message && (
        <div className={styles.successContainer}>
          <Alert title="Success" text={message} state="success" />
        </div>
      )}
    </div>
  )
}

export default FaucetPage
