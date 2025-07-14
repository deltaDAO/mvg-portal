import { FormikContextType, useFormikContext } from 'formik'
import React, { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FormPublishData } from '../_types'
import { wizardSteps } from '../_constants'
import styles from './index.module.css'
import CheckmarkIcon from '@images/checkmark.svg'

export default function Navigation(): ReactElement {
  const router = useRouter()
  const {
    values,
    errors,
    touched,
    setFieldValue
  }: FormikContextType<FormPublishData> = useFormikContext()

  function getSuccessClass(step: number) {
    const isSuccessMetadata = errors.metadata === undefined
    const isSuccessAccessPolicies =
      values.step2Completed && errors.credentials === undefined
    const isSuccessServices = errors.services === undefined
    const isSuccessPricing =
      errors.pricing === undefined &&
      (touched.pricing?.price || touched.pricing?.freeAgreement)

    const additionalDdosAreValid =
      values.additionalDdosPageVisited &&
      values.additionalDdos?.map((ddo) => ddo.data?.length > 0).every(Boolean)

    const isSuccessCustomDDO =
      errors.additionalDdos === undefined && additionalDdosAreValid

    const isSuccessPreview =
      isSuccessMetadata &&
      isSuccessAccessPolicies &&
      isSuccessServices &&
      isSuccessPricing &&
      isSuccessCustomDDO &&
      values.previewPageVisited

    const isSuccess =
      (step === 1 && isSuccessMetadata) ||
      (step === 2 && isSuccessAccessPolicies) ||
      (step === 3 && isSuccessServices) ||
      (step === 4 && isSuccessPricing) ||
      (step === 5 && isSuccessCustomDDO) ||
      (step === 6 && isSuccessPreview)

    return isSuccess
  }

  function handleStepClick(step: number) {
    router.push(`/publish/${step}`)
  }

  function handleKeyDown(event: React.KeyboardEvent, step: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleStepClick(step)
    }
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

  const currentStep = values.user.stepCurrent

  // Progress bar function - COMMENTED OUT

  // const getProgressWidth = () => {
  //   const progressPercentage = (currentStep / wizardSteps.length) * 100
  //   return `${progressPercentage}%`
  // }

  return (
    <nav className={styles.navigation}>
      {/* Single Row with All Steps */}
      <div className={styles.stepsRow}>
        {wizardSteps.map((step) => {
          const isActive = step.step === currentStep
          const isCompleted = getSuccessClass(step.step)

          return (
            <div
              key={step.step}
              className={`${styles.step} ${
                isActive ? styles.activeStep : styles.inactiveStep
              }`}
              onClick={() => handleStepClick(step.step)}
              onKeyDown={(e) => handleKeyDown(e, step.step)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Step ${step.step}: ${step.title}${
                isCompleted ? ' (completed)' : ''
              }`}
            >
              <div
                className={`${
                  isActive ? styles.activeStepCircle : styles.inactiveStepCircle
                } ${isCompleted ? styles.completed : ''}`}
              >
                {isCompleted ? <CheckmarkIcon /> : step.step}
              </div>
              <span
                className={`${
                  isActive ? styles.activeStepLabel : styles.inactiveStepLabel
                }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress Bar - COMMENTED OUT */}

      {/* <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: getProgressWidth() }}
        ></div>
      </div> */}
    </nav>
  )
}
