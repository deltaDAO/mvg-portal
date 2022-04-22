import React, { ReactElement } from 'react'
import styles from './Stepper.module.css'
import classNames from 'classnames/bind'
import Button from '../../../atoms/Button'
import { NavigationDirections } from '.'

const cx = classNames.bind(styles)

export default function Stepper({
  stepLabels,
  currentStep,
  setCurrentStep,
  setNavigationDirection
}: {
  stepLabels: string[]
  currentStep: number
  setCurrentStep: (step: number) => void
  setNavigationDirection: (direction: NavigationDirections) => void
}): ReactElement {
  const handleClick = (newStep: number) => {
    currentStep > newStep
      ? setNavigationDirection(NavigationDirections.PREV)
      : setNavigationDirection(NavigationDirections.NEXT)

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
function setNavigationDirection(arg0: string) {
  throw new Error('Function not implemented.')
}
