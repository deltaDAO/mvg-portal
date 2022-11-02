import React, { ReactElement } from 'react'
import classNames from 'classnames/bind'
import styles from './Navigation.module.css'
import Button from '../../../atoms/Button'
import { NavigationDirections } from '.'
import { toast } from 'react-toastify'
import { getErrorMessage } from '../../../../utils/onboarding'
import { useWeb3 } from '../../../../providers/Web3'

const cx = classNames.bind(styles)

export default function Navigation({
  currentStep,
  onboardingCompleted,
  setCurrentStep,
  setNavigationDirection,
  totalStepsCount
}: {
  currentStep: number
  onboardingCompleted: boolean
  setCurrentStep: (currentStep: number) => void
  setNavigationDirection: (direction: NavigationDirections) => void
  totalStepsCount: number
}): ReactElement {
  const { accountId, networkId, web3Provider } = useWeb3()

  const handlePreviousStep = () => {
    if (currentStep === 0) return
    setNavigationDirection(NavigationDirections.PREV)
    setCurrentStep(currentStep - 1)
  }

  const handleNextStep = () => {
    if (currentStep === totalStepsCount - 1) return
    if (currentStep === totalStepsCount - 2 && !onboardingCompleted) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId
        })
      )
      return
    }
    setNavigationDirection(NavigationDirections.NEXT)
    setCurrentStep(currentStep + 1)
  }

  return (
    <div className={styles.navigation}>
      <Button
        style="text"
        className={cx({
          hidden: currentStep === 0
        })}
        onClick={handlePreviousStep}
      >
        Previous Step
      </Button>
      <Button
        style="outline"
        onClick={() => handleNextStep()}
        className={cx({
          hidden: currentStep === totalStepsCount - 1
        })}
      >
        Next Step
      </Button>
    </div>
  )
}
