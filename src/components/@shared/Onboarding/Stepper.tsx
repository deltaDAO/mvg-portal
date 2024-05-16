import { ReactElement } from 'react'
import styles from './Stepper.module.css'
import classNames from 'classnames/bind'
import Button from '../atoms/Button'
import { NavigationDirections } from '.'
import { toast } from 'react-toastify'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { getErrorMessage } from '@utils/onboarding'

const cx = classNames.bind(styles)

export default function Stepper({
  stepLabels,
  currentStep,
  onboardingCompleted,
  setCurrentStep,
  setNavigationDirection
}: {
  stepLabels: string[]
  currentStep: number
  onboardingCompleted: boolean
  setCurrentStep: (step: number) => void
  setNavigationDirection: (direction: NavigationDirections) => void
}): ReactElement {
  const { address: accountId } = useAccount()
  const web3Provider = useProvider()
  const { chain } = useNetwork()

  const getNavigationDirection = (
    currentStep: number,
    newStep: number
  ): NavigationDirections => {
    return currentStep > newStep
      ? NavigationDirections.PREV
      : NavigationDirections.NEXT
  }

  const handleClick = (newStep: number) => {
    if (newStep === stepLabels.length - 1 && !onboardingCompleted) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId: chain?.id
        })
      )
      return
    }

    const navigationDirection = getNavigationDirection(currentStep, newStep)

    setNavigationDirection(navigationDirection)
    setCurrentStep(newStep)
  }
  return (
    <div>
      <ol className={styles.stepper}>
        {stepLabels.map((label, i) => (
          <li
            key={i}
            className={cx({
              step: true,
              active: i <= currentStep
            })}
          >
            <Button
              style="text"
              className={styles.title}
              onClick={() => handleClick(i)}
            >
              {label}
            </Button>
          </li>
        ))}
      </ol>
    </div>
  )
}
