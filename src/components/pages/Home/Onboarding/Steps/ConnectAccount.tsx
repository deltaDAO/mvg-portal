import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { useWeb3 } from '../../../../../providers/Web3'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

export default function ConnectAccount({
  title,
  subtitle,
  body,
  image
}: OnboardingStep): ReactElement {
  const { accountId, connect } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (accountId) {
      setCompleted(true)
    } else {
      setCompleted(false)
    }
  }, [accountId])

  const connectAccount = async () => {
    setLoading(true)
    try {
      await connect()
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image.childImageSharp.original.src}>
        <StepActions
          buttonLabel="Connect Account"
          buttonAction={async () => await connectAccount()}
          successMessage="Your account is connected to the portal"
          loading={loading}
          completed={completed}
        />
      </StepBody>
    </div>
  )
}
