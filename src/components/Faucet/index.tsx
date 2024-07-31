import { ReactElement, useCallback, useEffect, useState } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import styles from './index.module.css'
import Button from '@components/@shared/atoms/Button'
import Loader from '@components/@shared/atoms/Loader'
import Alert from '@components/@shared/atoms/Alert'
import content from '../../../content/pages/faucet.json'
import { ethers } from 'ethers'
import { getMessage, requestTokens } from '../../@utils/faucet'
import { useAccount, useSignMessage } from 'wagmi'
import { toast } from 'react-toastify'

interface Content {
  title: string
  description: string
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
}

const networkNameMap: { [key: number]: string } = {
  32456: 'Pontus-X Devnet',
  32457: 'Pontus-X Testnet'
}

const FaucetPage = (): ReactElement => {
  const { input }: Content = content
  const { label, buttonLabel } = input

  const [isLoading, setIsLoading] = useState(false)
  const [isRequestingTokens, setIsRequestingTokens] = useState(false)
  const [address, setAddress] = useState<string>('')
  const [network, setNetwork] = useState<string>('Unknown')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const { address: accountAddress } = useAccount()

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

  useEffect(() => {
    const fetchAddressAndNetwork = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        setAddress(address)
        setNetwork(networkNameMap[network.chainId] || 'Unknown')
      } catch (error) {
        LoggerInstance.error(error)
      }
    }

    fetchAddressAndNetwork()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', fetchAddressAndNetwork)
      window.ethereum.on('chainChanged', fetchAddressAndNetwork)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          fetchAddressAndNetwork
        )
        window.ethereum.removeListener('chainChanged', fetchAddressAndNetwork)
      }
    }
  }, [])

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Welcome to the Pontus-X Faucet</h2>
      <p className={styles.description}>
        A faucet is a service that provides free tokens for testing purposes.
        Known accounts can request 100 EUROe fee tokens and 1000 EUROe payment
        tokens to use on the Pontus-X network. These tokens are available every
        12 hours.
      </p>
      <div className={styles.instructions}>
        <h3>How to Request Tokens:</h3>
        <ol>
          <li>Ensure you have a web3 wallet (e.g. MetaMask) connected.</li>
          <li>
            Your wallet address will be automatically detected and displayed
            below.
          </li>
          <li>
            Click the &quot;Get Tokens&quot; button to request your free tokens.
          </li>
          <li>Wait for a few seconds while the request is processed.</li>
          <li>
            You will receive a confirmation once the tokens are successfully
            added to your wallet.
          </li>
        </ol>
        <p>
          <strong>Note:</strong> You can only request tokens once every 12
          hours. If you encounter any issues, please try again later.
        </p>
      </div>
      <div className={styles.address}>
        <strong>{label}:</strong> {address}
      </div>
      <div className={styles.network}>
        <strong>Connected Network:</strong> {network}
      </div>
      <form className={styles.form} onSubmit={handleSearchStart}>
        <Button
          disabled={!address || isLoading || isRequestingTokens}
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
