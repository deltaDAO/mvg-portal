import React, { FormEvent, ReactElement, RefObject } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import { FormikContextType, useFormikContext } from 'formik'
import Loader from '@shared/atoms/Loader'
import { FormComputeData } from '@components/ComputeWizard/_types'

interface WizardActionsProps {
  totalSteps: number
  submitButtonText: string
  continueButtonText?: string
  showSuccessConfetti?: boolean
  scrollToRef?: RefObject<any>
  formikContext?: FormikContextType<any>
  isContinueDisabled?: boolean
  rightAlignFirstStep?: boolean
}

export default function WizardActions({
  totalSteps,
  submitButtonText,
  continueButtonText = 'Continue',
  showSuccessConfetti = false,
  scrollToRef,
  formikContext,
  isContinueDisabled = false,
  rightAlignFirstStep = true
}: WizardActionsProps): ReactElement {
  const {
    values,
    errors,
    isSubmitting,
    setFieldValue
  }: FormikContextType<FormComputeData> = useFormikContext()

  React.useEffect(() => {
    const flow = totalSteps === 6 ? 'algorithm' : 'dataset'
    const datasetCount = Array.isArray(values?.dataset)
      ? values.dataset.length
      : 0
    const environmentSelected = Boolean(values?.computeEnv)
    const configSet =
      Number(values?.cpu) > 0 &&
      Number(values?.ram) > 0 &&
      Number(values?.disk) > 0 &&
      Number(values?.jobDuration) > 0
    const agreementsChecked = Boolean(
      values?.termsAndConditions && values?.acceptPublishingLicense
    )
    const wizardComplete = Boolean(
      (flow === 'algorithm' ? datasetCount > 0 : Boolean(values?.algorithm)) &&
        environmentSelected &&
        configSet &&
        agreementsChecked
    )

    const state = {
      flow,
      currentStep: values?.user?.stepCurrent,
      completedFlags: {
        step1Completed: values?.step1Completed,
        step2Completed: values?.step2Completed,
        step3Completed: values?.step3Completed,
        step4Completed: values?.step4Completed,
        step5Completed: (values as unknown as { step5Completed?: boolean })
          ?.step5Completed,
        step6Completed: (values as unknown as { step6Completed?: boolean })
          ?.step6Completed
      },
      selections: {
        algorithm: values?.algorithm,
        dataset: values?.dataset,
        datasetCount
      },
      environment: values?.computeEnv,
      resources: {
        cpu: values?.cpu,
        ram: values?.ram,
        disk: values?.disk,
        jobDuration: values?.jobDuration
      },
      agreements: {
        termsAndConditions: values?.termsAndConditions,
        acceptPublishingLicense: values?.acceptPublishingLicense
      },
      validationErrors: errors,
      wizardComplete,
      nextButtonDisabled: isContinueDisabled
    }

    console.log('Wizard state', state)
  }, [values, errors, isContinueDisabled, totalSteps])

  function handleAction(action: string) {
    const currentStep: number = values.user.stepCurrent
    const newStep = action === 'next' ? currentStep + 1 : currentStep - 1

    console.log(
      'WizardActions - currentStep:',
      currentStep,
      'newStep:',
      newStep,
      'action:',
      action
    )

    if (newStep >= 1 && newStep <= totalSteps) {
      setFieldValue('user.stepCurrent', newStep)
      console.log('WizardActions - setFieldValue called with:', newStep)
    }

    if (scrollToRef?.current) {
      scrollToRef.current.scrollIntoView()
    }
  }

  function handleNext(e: FormEvent) {
    e.preventDefault()

    // Set step completion flags
    if (values.user.stepCurrent === 1) setFieldValue('step1Completed', true)
    if (values.user.stepCurrent === 2) setFieldValue('step2Completed', true)
    if (values.user.stepCurrent === 3) setFieldValue('step3Completed', true)
    if (values.user.stepCurrent === 4) setFieldValue('step4Completed', true)
    if (values.user.stepCurrent === 5) setFieldValue('step5Completed', true)
    if (values.user.stepCurrent === 6) {
      setFieldValue('step6Completed', true)
      setFieldValue('previewPageVisited', true)
    }
    if (values.user.stepCurrent === 7) {
      setFieldValue('submissionPageVisited', true)
    }

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
        <Button type="submit" style="publish" disabled={false}>
          {isSubmitting ? <Loader variant="primary" /> : submitButtonText}
        </Button>
      )}
    </footer>
  )
}
