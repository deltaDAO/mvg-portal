import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './Navigation.module.css'
import Button from '../../../atoms/Button'
import { NavigationDirections } from '.'

const cx = classNames.bind(styles)

export default function Navigation({
  currentStep,
  setCurrentStep,
  setNavigationDirection,
  totalStepsCount
}: {
  currentStep: number
  setCurrentStep: (currentStep: number) => void
  setNavigationDirection: (direction: NavigationDirections) => void
  totalStepsCount: number
}): ReactElement {
  const handlePreviousStep = () => {
    if (currentStep === 0) return
    setNavigationDirection(NavigationDirections.PREV)
    setCurrentStep(currentStep - 1)
  }

  const handleNextStep = () => {
    if (currentStep === totalStepsCount - 1) return
    setNavigationDirection(NavigationDirections.NEXT)
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
        style="outline"
        onClick={() => handleNextStep()}
        className={cx({
          hide: currentStep === totalStepsCount - 1
        })}
      >
        Next Step
      </Button>
    </div>
  )
}
