import React, { ReactElement } from 'react'
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
  const handleClick = async (ctaAction: string) => {
    setStepStatus({
      ...stepStatus,
      [ctaAction]: { ...stepStatus[ctaAction], loading: true }
    })
    try {
      await mainActions[ctaAction as keyof typeof mainActions].run()
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setStepStatus({
        ...stepStatus,
        [ctaAction]: { ...stepStatus[ctaAction], loading: false }
      })
    }
  }
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
                        stepStatus[cta.ctaAction].loading ? (
                          <Loader key={i} message="Loading..." />
                        ) : (
                          <Button
                            key={i}
                            style="primary"
                            onClick={async () =>
                              await handleClick(cta.ctaAction)
                            }
                          >
                            {cta.ctaLabel}
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
