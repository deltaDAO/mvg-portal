import { FormEvent, ReactElement, RefObject } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import { FormikContextType, useFormikContext } from 'formik'
import { useRouter } from 'next/router'
import Loader from '@shared/atoms/Loader'

interface WizardActionsProps {
  navigationType: 'query' | 'path'
  basePath: string
  totalSteps: number
  submitButtonText: string
  continueButtonText?: string
  showSuccessConfetti?: boolean
  scrollToRef?: RefObject<any>
  did?: string
  isContinueDisabled?: boolean
  formikContext: FormikContextType<any>
  rightAlignFirstStep?: boolean
}

export default function WizardActions({
  navigationType,
  basePath,
  totalSteps,
  submitButtonText,
  continueButtonText = 'Continue',
  showSuccessConfetti = false,
  scrollToRef,
  did,
  isContinueDisabled = false,
  formikContext,
  rightAlignFirstStep = true
}: WizardActionsProps): ReactElement {
  const router = useRouter()
  const { values, errors, isValid, isSubmitting, setFieldValue } = formikContext

  function handleAction(action: string) {
    const currentStep: number = values.user.stepCurrent

    if (navigationType === 'query') {
      // Publish-style navigation with query parameters
      router.push({
        pathname: basePath,
        query: { step: currentStep + (action === 'next' ? +1 : -1) }
      })
    } else {
      // Compute-style navigation with path parameters
      const newStep = currentStep + (action === 'next' ? +1 : -1)
      router.push(`${basePath}/${newStep}`)
    }

    if (scrollToRef?.current) {
      scrollToRef.current.scrollIntoView()
    }
  }

  function handleNext(e: FormEvent) {
    e.preventDefault()

    // Set step completion flags (Publish-specific logic)
    if (values.user.stepCurrent === 1) setFieldValue('step1Completed', true)
    if (values.user.stepCurrent === 2) setFieldValue('step2Completed', true)
    if (values.user.stepCurrent === 3) setFieldValue('step3Completed', true)
    if (values.user.stepCurrent === 4) setFieldValue('step4Completed', true)
    if (values.user.stepCurrent === 5) setFieldValue('step5Completed', true)
    if (values.user.stepCurrent === 6) {
      setFieldValue('step6Completed', true)
      setFieldValue('previewPageVisited', true)
    }
    if (values.user.stepCurrent === 7)
      setFieldValue('submissionPageVisited', true)

    handleAction('next')
  }

  function handlePrevious(e: FormEvent) {
    e.preventDefault()
    handleAction('prev')
  }

  const currentStep = values.user.stepCurrent
  const isLastStep = currentStep === totalSteps
  const isFirstStep = currentStep === 1
  const actionsClassName =
    isFirstStep && rightAlignFirstStep ? styles.actionsRight : styles.actions

  return (
    <footer className={actionsClassName}>
      {currentStep > 1 && (
        <Button onClick={handlePrevious} disabled={isSubmitting}>
          Back
        </Button>
      )}

      {!isLastStep ? (
        <Button
          style="publish"
          onClick={handleNext}
          disabled={isContinueDisabled}
        >
          {continueButtonText}
        </Button>
      ) : (
        <Button
          type="submit"
          style="publish"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? <Loader variant="primary" /> : submitButtonText}
        </Button>
      )}
    </footer>
  )
}
