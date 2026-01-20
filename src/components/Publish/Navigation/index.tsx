import { FormikContextType, useFormikContext } from 'formik'
import { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FormPublishData } from '../_types'
import { wizardSteps } from '../_constants'
import styles from './index.module.css'

export default function Navigation(): ReactElement {
  const router = useRouter()
  const {
    values,
    errors,
    touched,
    setFieldValue
  }: FormikContextType<FormPublishData> = useFormikContext()

  function handleStepClick(step: number) {
    // Change step view
    router.push(`/publish/${step}`)
  }

  function getSuccessClass(step: number) {
    // Only mark steps as successful if they are BEFORE the current step
    // and their respective validations have no errors. This avoids showing
    // checks on initial load before the user interacts with the form.
    const isPastStep = values.user.stepCurrent > step

    const isSuccessMetadata = isPastStep && errors.metadata === undefined
    const isSuccessServices = isPastStep && errors.services === undefined
    const isSuccessPolices = isPastStep && errors.policies === undefined
    const isSuccessPricing =
      isPastStep &&
      errors.pricing === undefined &&
      (touched.pricing?.price || touched.pricing?.freeAgreement)
    const isSuccessPreview =
      isPastStep && isSuccessMetadata && isSuccessServices && isSuccessPricing

    const isSuccess =
      (step === 1 && isSuccessMetadata) ||
      (step === 2 && isSuccessServices) ||
      (step === 3 && isSuccessPolices) ||
      (step === 4 && isSuccessPricing) ||
      (step === 5 && isSuccessPreview)

    return isSuccess ? styles.success : null
  }

  useEffect(() => {
    let step = 1
    if (router.query?.step) {
      const currentStep: string = router.query.step as string
      const stepParam: number = parseInt(currentStep)
      // check if query param is a valid step, if not we take the user to step 1
      stepParam <= wizardSteps.length ? (step = stepParam) : handleStepClick(1)
    }
    // load current step on refresh - CAUTION: all data will be deleted anyway
    setFieldValue('user.stepCurrent', step)
  }, [router])

  return (
    <nav className={styles.navigation}>
      <ol>
        {wizardSteps.map((step) => (
          <li
            key={step.title}
            onClick={() => handleStepClick(step.step)}
            className={`${
              values.user.stepCurrent === step.step ? styles.current : null
            } ${getSuccessClass(step.step)}`}
          >
            {step.title}
          </li>
        ))}
      </ol>
    </nav>
  )
}
