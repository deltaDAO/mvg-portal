import { ReactElement } from 'react'
import { FormikContextType, useFormikContext } from 'formik'
import { ComputeFlow, FormComputeData } from '../_types'
import { useProgressBar } from '@hooks/useProgressBar'
import { useComputeStepCompletion } from '@hooks/useComputeStepCompletion'
import styles from './index.module.css'
import CheckmarkIcon from '@images/checkmark.svg'
import { getDatasetSteps } from '@components/ComputeWizard/_steps'

interface NavigationProps {
  flow: ComputeFlow
}

export default function Navigation({ flow }: NavigationProps): ReactElement {
  const { values, setFieldValue }: FormikContextType<FormComputeData> =
    useFormikContext()
  const isAlgorithmFlow = flow === 'algorithm'
  const { getSuccessClass, getLastCompletedStep } =
    useComputeStepCompletion(isAlgorithmFlow)
  const currentStep = values.user.stepCurrent
  const hasUserParamsStep = Boolean(values?.isUserParameters)
  const withoutDataset = Boolean(values?.withoutDataset)
  const steps = isAlgorithmFlow
    ? getDatasetSteps(hasUserParamsStep, withoutDataset)
    : getDatasetSteps(hasUserParamsStep, withoutDataset).map((step) => ({
        ...step,
        title: step.step === 1 ? 'Select Algorithm' : step.title
      }))
  const lastCompletedStep = getLastCompletedStep()
  const progressTargetIdx = Math.min(lastCompletedStep + 1, steps.length)
  const { stepRefs, stepsRowRef, progressBarWidth } = useProgressBar({
    progressTargetIdx
  })

  const handleStepClick = (stepNumber: number) => {
    setFieldValue('user.stepCurrent', stepNumber)
  }

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
              onClick={() => handleStepClick(step.step)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStepClick(step.step)
                }
              }}
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
