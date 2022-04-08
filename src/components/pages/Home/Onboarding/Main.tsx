import React, { ReactElement } from 'react'
import Button from '../../../atoms/Button'
import Container from '../../../atoms/Container'
import Markdown from '../../../atoms/Markdown'
import styles from './Main.module.css'
import { OnboardingStep } from './index'

export default function Main({
  currentStep = 0,
  steps
}: {
  currentStep: number
  steps: OnboardingStep[]
}): ReactElement {
  return (
    <>
      <div className={styles.header}>
        <h3 className={styles.title}>{steps?.[currentStep].title}</h3>
        <h5 className={styles.subtitle}>{steps?.[currentStep].subtitle}</h5>
      </div>
      <div className={styles.content}>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <Markdown
              text={steps?.[currentStep].body}
              className={styles.paragraph}
            />
            <div className={styles.actions}>
              {steps && [currentStep] &&
                steps[currentStep].cta.map((e, i) => (
                  <Button key={i} style="primary">
                    {e.ctaLabel}
                  </Button>
                ))}
            </div>
          </div>
        </div>
        {steps?.[currentStep]?.image && (
          <img
            src={steps?.[currentStep].image.childImageSharp.original.src}
            className={styles.image}
          />
        )}
      </div>
    </>
  )
}
