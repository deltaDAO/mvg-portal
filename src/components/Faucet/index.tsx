import { ReactElement, useCallback, useEffect, useState } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import styles from './index.module.css'
import InputGroup from '@components/@shared/FormInput/InputGroup'
import InputElement from '@components/@shared/FormInput/InputElement'
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

export default function FaucetPage({
  didQueryString
}: {
  didQueryString?: string
}): ReactElement {
  const { input }: Content = content
  const { label, placeholder, buttonLabel } = input

  const [isLoading, setIsLoading] = useState(false)
  const [did, setDid] = useState<string>('')
  const [message, setMessage] = useState<string>()
  const [error, setError] = useState<string>()

  const { address } = useAccount()

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
      const message = await getMessage(address)

      signMessage({ message })
    } catch (error) {
      LoggerInstance.error(error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearchStart = () => {
    handleVerify()
  }

  const faucetTokenRequest = async () => {
    try {
      const hashes = await requestTokens(address, signMessageData)

      toast.success(`Successfully requested test tokens: ${hashes.join(', ')}`)
      setMessage(
        'Tokens successfully requested. It can take up to 30 seconds until tokens show up in your wallet.'
      )
    } catch (error) {
      toast.error('Unable to request tokens. Please try again.')
      LoggerInstance.error('[Onboarding] Error requesting tokens', error)
    }
  }

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
    signMessageLoading
  ])

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        setDid(address)
      } catch (error) {
        LoggerInstance.error(error)
      }
    }

    fetchAddress()

    if (didQueryString) {
      setDid(didQueryString)
      handleVerify()
    }
  }, [didQueryString, handleVerify])

  return (
    <div>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault()
          handleSearchStart()
        }}
      >
        <InputGroup>
          <InputElement
            className={styles.didInput}
            label={label}
            name="did"
            onChange={(event) =>
              setDid((event.target as HTMLInputElement).value)
            }
            placeholder={placeholder}
            value={did}
            readOnly
          />
          <Button
            disabled={!did || isLoading}
            style="primary"
            size="small"
            type="submit"
          >
            {isLoading ? <Loader /> : buttonLabel}
          </Button>
        </InputGroup>
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
