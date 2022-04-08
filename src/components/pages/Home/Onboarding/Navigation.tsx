import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './Navigation.module.css'
import Button from '../../../atoms/Button'

const cx = classNames.bind(styles)

export default function Navigation({
  currentStep,
  setCurrentStep,
  totalStepCount
}: {
  currentStep: number
  setCurrentStep: (currentStep: number) => void
  totalStepCount: number
}): ReactElement {
  const handlePreviousStep = () => {
    if (currentStep === 0) return
    setCurrentStep(currentStep - 1)
  }

  const handleNextStep = () => {
    if (currentStep === totalStepCount - 1) return
    setCurrentStep(currentStep + 1)
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
        style="primary"
        onClick={handleNextStep}
        className={cx({
          hide: currentStep === totalStepCount - 1
        })}
      >
        Next Step
      </Button>
    </div>
  )
}
