import React, { ReactElement, useState } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'

export default function OnboardingSection(): ReactElement {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div className={styles.wrapper}>
      <Header />
      <Main currentStep={currentStep} />
    </div>
  )
}
