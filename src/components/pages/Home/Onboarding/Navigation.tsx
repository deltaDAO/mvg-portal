import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './Navigation.module.css'
import Button from '../../../atoms/Button'
import { CurrentStepStatus, OnboardingStep } from '.'
import { toast } from 'react-toastify'

const cx = classNames.bind(styles)

export default function Navigation({
  currentStep,
  mainActions,
  setCurrentStep,
  stepStatus,
  steps,
  totalStepsCount
}: {
  currentStep: number
  mainActions: any
  setCurrentStep: (currentStep: number) => void
  stepStatus: CurrentStepStatus
  steps: OnboardingStep[]
  totalStepsCount: number
}): ReactElement {
  const handlePreviousStep = () => {
    if (currentStep === 0) return
    setCurrentStep(currentStep - 1)
  }

  const handleNextStep = () => {
    if (currentStep === totalStepsCount - 1) return
    setCurrentStep(currentStep + 1)
  }

  const handleVerify = () => {
    const isValid = steps[currentStep]?.cta
      .map((cta) => mainActions[cta.action].verify())
      .every((e) => e)

    if (!isValid) {
      toast.error(
        'You have to complete the current step before you can move to the next one'
      )
    }
    return isValid
  }
  return (
    <div className={styles.navigation}>
      <Button
        style="text"
        className={cx({
          hide: currentStep === 0
        })}
        onClick={handlePreviousStep}
      >
        Previous Step
      </Button>
      <Button
        disabled={
          !steps?.[currentStep]?.cta?.every(
            (cta) => stepStatus?.[cta.action].completed
          )
        }
        style="outline"
        onClick={() => {
          if (!handleVerify()) return
          handleNextStep()
        }}
        className={cx({
          hide: currentStep === totalStepsCount - 1
        })}
      >
        Next Step
      </Button>
    </div>
  )
}
