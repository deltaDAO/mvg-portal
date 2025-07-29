import { FormikContextType, useFormikContext } from 'formik'
import React, { ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FormComputeData } from '../_types'
import { wizardSteps } from '../_constants'
import { useProgressBar } from '../../../@hooks/useProgressBar'
import { useComputeStepCompletion } from '../../../@hooks/useComputeStepCompletion'
import styles from './index.module.css'
import CheckmarkIcon from '@images/checkmark.svg'

export default function Navigation(): ReactElement {
  const router = useRouter()
  const { values, setFieldValue }: FormikContextType<FormComputeData> =
    useFormikContext()

  const { getSuccessClass, getLastCompletedStep } = useComputeStepCompletion()

  function handleStepClick(step: number) {
    const { did } = router.query
    router.push(`/asset/${did}/compute/${step}`)
  }

  function handleKeyDown(event: React.KeyboardEvent, step: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleStepClick(step)
    }
  }

  useEffect(() => {
    let step = 1
    // Extract step from path for compute flow
    const pathSegments = router.asPath.split('/')
    const stepIndex = pathSegments.findIndex((segment) => segment === 'compute')
    if (stepIndex !== -1 && pathSegments[stepIndex + 1]) {
      const stepParam: number = parseInt(pathSegments[stepIndex + 1])
      if (!isNaN(stepParam) && stepParam <= wizardSteps.length) {
        step = stepParam
      }
    }
    setFieldValue('user.stepCurrent', step)
  }, [router.asPath, setFieldValue])

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
              ref={(el) => (stepRefs.current[step.step - 1] = el)}
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
