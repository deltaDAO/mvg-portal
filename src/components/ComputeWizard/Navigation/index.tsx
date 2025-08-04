import { FormikContextType, useFormikContext } from 'formik'
import React, { ReactElement } from 'react'
import { FormComputeData, StepContent } from '../_types'
import { useProgressBar } from '../../../@hooks/useProgressBar'
import { useComputeStepCompletion } from '../../../@hooks/useComputeStepCompletion'
import styles from './index.module.css'
import CheckmarkIcon from '@images/checkmark.svg'

export default function Navigation({
  steps
}: {
  steps: StepContent[]
}): ReactElement {
  const { values }: FormikContextType<FormComputeData> = useFormikContext()
  const { getSuccessClass, getLastCompletedStep } = useComputeStepCompletion()

  const currentStep = values.user.stepCurrent
  const lastCompletedStep = getLastCompletedStep(steps.length)
  const progressTargetIdx = Math.min(lastCompletedStep + 1, steps.length)

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
        {steps.map((step) => {
          const isActive = step.step === currentStep
          const isCompleted = getSuccessClass(step.step)
          return (
            <div
              key={step.step}
              className={`${styles.step} ${
                isActive ? styles.activeStep : styles.inactiveStep
              }`}
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
