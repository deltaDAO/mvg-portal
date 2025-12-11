import { FormikContextType, useFormikContext } from 'formik'
import React, { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FormPublishData } from '../_types'
import { wizardSteps } from '../_constants'
import { useProgressBar } from '../../../@hooks/useProgressBar'
import { useStepCompletion } from '../../../@hooks/useStepCompletion'
import styles from './index.module.css'
import CheckmarkIcon from '@images/checkmark.svg'

export default function Navigation(): ReactElement {
  const router = useRouter()
  const { values, setFieldValue }: FormikContextType<FormPublishData> =
    useFormikContext()

  const { getSuccessClass, getLastCompletedStep } = useStepCompletion()

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
      stepParam <= wizardSteps.length ? (step = stepParam) : handleStepClick(1)
    }
    setFieldValue('user.stepCurrent', step)
  }, [router, setFieldValue])

  const currentStep = values.user.stepCurrent
  const lastCompletedStep = getLastCompletedStep(wizardSteps.length)
  const progressTargetIdx = Math.min(lastCompletedStep + 1, wizardSteps.length)

  const { stepRefs, stepsRowRef, progressBarWidth } = useProgressBar({
    progressTargetIdx
  })

  return (
    <nav className={styles.navigation}>
      <div className={styles.stepsRow} ref={stepsRowRef}>
        <div
          className={styles.progressBar}
          style={{ width: `${progressBarWidth}px` }}
          aria-hidden="true"
        />
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
              ref={(el) => {
                stepRefs.current[step.step - 1] = el
              }}
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
    </nav>
  )
}
