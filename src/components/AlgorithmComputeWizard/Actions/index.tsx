import { ReactElement } from 'react'
import { useFormikContext } from 'formik'
import { useRouter } from 'next/router'
import Button from '@shared/atoms/Button'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

export default function Actions(): ReactElement {
  const router = useRouter()
  const { values, isSubmitting, submitForm }: any =
    useFormikContext<FormComputeData>()

  const currentStep = values.user.stepCurrent
  const isLastStep = currentStep === 4

  function handleBack() {
    if (currentStep > 1) {
      const { did } = router.query
      router.push(`/asset/${did}/compute/${currentStep - 1}`)
    } else {
      const { did } = router.query
      router.push(`/asset/${did}`)
    }
  }

  function handleContinue() {
    if (currentStep < 4) {
      const { did } = router.query
      router.push(`/asset/${did}/compute/${currentStep + 1}`)
    }
  }

  function handleSubmit() {
    submitForm()
  }

  return (
    <footer className={styles.actions}>
      {values.user.stepCurrent > 1 && (
        <Button
          type="button"
          style="text"
          onClick={handleBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
      )}
      {!isLastStep && (
        <Button
          type="button"
          style="publish"
          onClick={handleContinue}
          disabled={isSubmitting}
        >
          Continue
        </Button>
      )}
    </footer>
  )
}
