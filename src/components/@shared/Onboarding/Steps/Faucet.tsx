import { LoggerInstance } from '@oceanprotocol/lib'
import { getErrorMessage } from '@utils/onboarding'
import { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount, useNetwork, useProvider, useSignMessage } from 'wagmi'
import { OnboardingStep } from '..'
import { getSupportedChainIds } from '../../../../../chains.config'
import content from '../../../../../content/onboarding/steps/faucet.json'
import { getMessage, requestTokens } from '../../../../@utils/faucet'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'

export default function Faucet(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content

  const { address: accountId } = useAccount()
  const web3Provider = useProvider()
  const { chain } = useNetwork()

  const {
    data: signMessageData,
    error: signMessageError,
    isLoading: signMessageLoading,
    isSuccess: signMessageSuccess,
    signMessage
  } = useSignMessage()

  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const faucetTokenRequest = async () => {
    try {
      const hashes = await requestTokens(accountId, signMessageData)
      toast.success(`Successfully requested test tokens: ${hashes.join(', ')}`)
      setCompleted(true)
    } catch (error) {
      toast.error('Unable to request tokens. Please try again.')
      LoggerInstance.error('[Onboarding] Error requesting tokens', error)
    } finally {
      setLoading(false)
    }
  }

  const prepareMessage = async () => {
    setLoading(true)
    try {
      if (!getSupportedChainIds().includes(chain?.id))
        throw new Error(
          'The chain you are connected to with your wallet is not supported'
        )
      LoggerInstance.log('[Onboarding] Requesting nonce from faucet', {
        accountId
      })
      const message = await getMessage(accountId)

      signMessage({ message })
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId: chain?.id
        })
      )
      if (error.message) console.error(error.message)

      setLoading(false)
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

  const actions = [
    {
      buttonLabel: `Request Test EUROe Tokens`,
      buttonAction: async () => {
        await prepareMessage()
      },
      successMessage: `Successfully requested test tokens.`,
      loading,
      completed
    }
  ]

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
