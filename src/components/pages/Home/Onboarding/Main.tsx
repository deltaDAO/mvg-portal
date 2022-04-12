import React, { ReactElement, useEffect, useState } from 'react'
import classNames from 'classnames/bind'
import Button from '../../../atoms/Button'
import Markdown from '../../../atoms/Markdown'
import styles from './Main.module.css'
import { CurrentStepStatus, OnboardingStep } from './index'
import { toast } from 'react-toastify'
import Loader from '../../../atoms/Loader'
import Alert from '../../../atoms/Alert'

const cx = classNames.bind(styles)

export default function Main({
  currentStep = 0,
  mainActions,
  stepStatus,
  setStepStatus,
  steps
}: {
  currentStep: number
  mainActions: any
  stepStatus: CurrentStepStatus
  setStepStatus: (status: CurrentStepStatus) => void
  steps: OnboardingStep[]
}): ReactElement {
  const [currentStepChecks, setCurrentStepChecks] = useState<{
    [key: keyof typeof mainActions]: boolean
  }>({})

  const handleClick = async (action: string) => {
    setStepStatus({
      ...stepStatus,
      [action]: { ...stepStatus[action], loading: true, touched: true }
    })
    try {
      await mainActions[action as keyof typeof mainActions].run()
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setStepStatus({
        ...stepStatus,
        [action]: { ...stepStatus[action], loading: false, touched: true }
      })
    }
  }

  useEffect(() => {
    if (steps.length === 0) return
    if (
      steps?.[currentStep]?.cta?.every(
        (cta) => !stepStatus?.[cta.action].touched
      )
    ) {
      return
    }

    if (
      Object.values(currentStepChecks).length > 0 &&
      Object.values(stepStatus).length > 0 &&
      Object.keys(currentStepChecks).some(
        (key) => stepStatus[key].touched && currentStepChecks[key]
      )
    ) {
      if (
        Object.keys(currentStepChecks).every(
          (key) =>
            stepStatus[key].completed === currentStepChecks[key] &&
            stepStatus[key].touched
        )
      ) {
        return
      }
      const updatedStepStatus = { ...stepStatus }
      for (const key in currentStepChecks) {
        if (stepStatus[key].touched && currentStepChecks[key]) {
          updatedStepStatus[key] = {
            ...stepStatus[key],
            completed: currentStepChecks[key]
          }
        }
      }
      if (JSON.stringify(updatedStepStatus) === JSON.stringify(stepStatus)) {
        return
      }
      setStepStatus(updatedStepStatus)
      return
    }

    const executeChecksTimeout = setTimeout(() => {
      const runningCheck: {
        [key: keyof typeof mainActions]: boolean
      } = {}
      steps[currentStep]?.cta.forEach((cta) => {
        runningCheck[cta.action] = mainActions[cta.action].verify()
      })
      setCurrentStepChecks(runningCheck)
    }, 1000)

    return () => clearTimeout(executeChecksTimeout)
  }, [currentStep, stepStatus, currentStepChecks])

  useEffect(() => {
    setCurrentStepChecks({})
  }, [currentStep])

  useEffect(() => {
    console.log(currentStepChecks)
  }, [currentStepChecks])

  return (
    <div>
      {steps && stepStatus && (
        <div className={cx({ finalStep: currentStep === steps.length - 1 })}>
          <div className={styles.header}>
            <h3 className={styles.title}>{steps?.[currentStep].title}</h3>
            <h5 className={styles.subtitle}>{steps?.[currentStep].subtitle}</h5>
          </div>
          <div className={styles.content}>
            {currentStep < steps.length - 1 && (
              <div className={styles.cardContainer}>
                <div className={styles.card}>
                  <Markdown
                    text={steps?.[currentStep].body}
                    className={styles.paragraph}
                  />
                  <div className={styles.actions}>
                    {steps[currentStep]?.cta &&
                      steps[currentStep].cta.map((cta, i) =>
                        stepStatus[cta.action].loading ? (
                          <Loader key={i} message="Loading..." />
                        ) : cta?.successMessage &&
                          stepStatus?.[cta.action]?.touched &&
                          stepStatus?.[cta.action]?.completed ? (
                          <Alert
                            key={i}
                            text={cta?.successMessage}
                            state="success"
                            className={styles.success}
                          />
                        ) : (
                          <Button
                            key={i}
                            style="primary"
                            onClick={async () => await handleClick(cta.action)}
                          >
                            {cta.label}
                          </Button>
                        )
                      )}
                  </div>
                </div>
              </div>
            )}
            {steps?.[currentStep]?.image && (
              <img
                src={steps?.[currentStep].image.childImageSharp.original.src}
                className={styles.image}
              />
            )}
          </div>
          <Alert
            text={steps?.[currentStep]?.suggestion}
            state="suggestion"
            className={styles.suggestion}
          />
        </div>
      )}
    </div>
  )
}
