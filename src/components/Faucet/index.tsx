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

interface Content {
  title: string
  description: string
  input: {
    label: string
    placeholder: string
    buttonLabel: string
  }
}

async function fetchNonce(address: string): Promise<number> {
  const response = await fetch('http://localhost:3000/get_nonce', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  })

  const data = await response.json()
  if (data.status === 'success') {
    return data.nonce
  } else {
    throw new Error(data.message)
  }
}

async function requestTokens(
  address: string,
  signature: string
): Promise<{ status: string; message?: string }> {
  const response = await fetch('http://localhost:3000/request_tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address, signature })
  })

  const data = await response.json()
  return data
}

export default function VerifyPage({
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

  const handleVerify = useCallback(async () => {
    setIsLoading(true)
    setError(undefined)
    setMessage(undefined)

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const address = await signer.getAddress()

      const nonce = await fetchNonce(address)
      const message = `I am requesting tokens for ${address} with nonce: ${nonce}`
      const signature = await signer.signMessage(message)

      const response = await requestTokens(address, signature)

      if (response.status === 'success') {
        setMessage(
          'Tokens successfully requested. It can take up to 30 seconds until tokens show up in your wallet.'
        )
      } else {
        setError(response.message)
      }
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
