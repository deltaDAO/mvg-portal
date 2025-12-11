import { FormEvent, ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { getErrorMessage } from '@utils/onboarding'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import { useAccount, useChainId, usePublicClient } from 'wagmi'
import content from '../../../../../content/onboarding/steps/connectAccount.json'
import { useModal } from 'connectkit'

export default function ConnectAccount(): ReactElement {
  const {
    title,
    subtitle,
    body,
    image,
    buttonLabel,
    buttonSuccess
  }: OnboardingStep = content
  const { address: accountId } = useAccount()
  const web3Provider = usePublicClient()
  const chainId = useChainId()
  const { setOpen } = useModal()

  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (accountId) {
      setCompleted(true)
    } else {
      setCompleted(false)
    }
  }, [accountId])

  const connectAccount = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault()

    try {
      setLoading(true)
      setOpen(true)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId: chainId
        })
      )
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    {
      buttonLabel,
      buttonAction: async (e) => await connectAccount(e),
      successMessage: buttonSuccess,
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
