import React, { ReactElement } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../../../atoms/Container'
import Stepper from './Stepper'
import DownloadMetamask from './Steps/DownloadMetaMask'
import ConnectAccount from './Steps/ConnectAccount'
import ConnectNetwork from './Steps/ConnectNetwork'
import ImportOceanToken from './Steps/ImportOceanToken'
import Ready from './Steps/Ready'
import ClaimTokens from './Steps/ClaimTokens'
import { useUserPreferences } from '../../../../providers/UserPreferences'

export interface OnboardingStep {
  title: string
  subtitle: string
  body: string
  image?: {
    childImageSharp: {
      original: {
        src: string
      }
    }
  }
  buttonLabel?: string
  buttonSuccess?: string
}

const steps = [
  { shortLabel: 'MetaMask', component: <DownloadMetamask /> },
  { shortLabel: 'Connect', component: <ConnectAccount /> },
  { shortLabel: 'Network', component: <ConnectNetwork /> },
  { shortLabel: 'Tokens', component: <ImportOceanToken /> },
  { shortLabel: 'Faucet', component: <ClaimTokens /> },
  { shortLabel: 'Ready', component: <Ready /> }
]

export default function OnboardingSection(): ReactElement {
  const { onboardingStep, setOnboardingStep } = useUserPreferences()
  const stepLabels = steps?.map((step) => step.shortLabel)

  return (
    <div className={styles.wrapper}>
      <Header />
      {steps.length > 0 && (
        <Container className={styles.cardWrapper}>
          <div className={styles.cardContainer}>
            <Stepper stepLabels={stepLabels} currentStep={onboardingStep} />
            {steps[onboardingStep].component}
            {/* <Main
              currentStep={currentStep}
              steps={steps.map((step) => step.component)}
            /> */}
            <Navigation
              currentStep={onboardingStep}
              setCurrentStep={setOnboardingStep}
              totalStepsCount={steps.length}
            />
          </div>
        </Container>
      )}
    </div>
  )
}
