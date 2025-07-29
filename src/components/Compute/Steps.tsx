import { ReactElement, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { wizardSteps, initialComputeFeedback } from './_constants'
import { FormComputeData, ComputeFeedback } from './_types'
import { useAccount, useNetwork } from 'wagmi'

export function Steps({
  feedback
}: {
  feedback: ComputeFeedback
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chain } = useNetwork()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()

  // auto-sync user chain?.id & account into form data values
  useEffect(() => {
    if (!chain?.id || !accountId) return

    setFieldValue('user.chainId', chain?.id)
    setFieldValue('user.accountId', accountId)
  }, [chain?.id, accountId, setFieldValue])

  // auto-sync compute feedback into form data values
  useEffect(() => {
    setFieldValue('feedback', feedback)
  }, [feedback, setFieldValue])

  const { component } = wizardSteps.filter((stepContent) => {
    return stepContent.step === values.user.stepCurrent
  })[0]

  return component
}
