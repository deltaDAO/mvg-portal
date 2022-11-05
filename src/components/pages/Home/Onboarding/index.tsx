import React, { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../../../atoms/Container'
import Stepper from './Stepper'
import DownloadMetamask from './Steps/DownloadMetamask'
import ConnectAccount from './Steps/ConnectAccount'
import ConnectNetwork from './Steps/ConnectNetwork'
import ImportOceanToken from './Steps/ImportOceanToken'
import Ready from './Steps/Ready'
import ClaimTokens from './Steps/ClaimTokens'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import { useWeb3 } from '../../../../providers/Web3'
import { GEN_X_NETWORK_ID } from '../../../../../chains.config'

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

export enum NavigationDirections {
  PREV = 'prev',
  NEXT = 'next'
}

export default function OnboardingSection(): ReactElement {
  const { accountId, balance, networkId, web3Provider } = useWeb3()
  const { onboardingStep, setOnboardingStep } = useUserPreferences()
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [navigationDirection, setNavigationDirection] =
    useState<NavigationDirections>()
  const stepLabels = steps.map((step) => step.shortLabel)

  useEffect(() => {
    if (onboardingStep > steps.length) setOnboardingStep(0)
  }, [onboardingStep, setOnboardingStep])

  useEffect(() => {
    if (accountId && web3Provider && networkId === GEN_X_NETWORK_ID) {
      setOnboardingCompleted(true)
    }
  }, [accountId, balance, networkId, web3Provider])

  return (
    <div className={styles.wrapper}>
      <Header />
      <Container className={styles.cardWrapper}>
        <div className={styles.cardContainer}>
          <Stepper
            stepLabels={stepLabels}
            currentStep={onboardingStep}
            onboardingCompleted={onboardingCompleted}
            setCurrentStep={setOnboardingStep}
            setNavigationDirection={setNavigationDirection}
          />
          <Main
            currentStep={onboardingStep}
            navigationDirection={navigationDirection}
            steps={steps}
          />
          <Navigation
            currentStep={onboardingStep}
            onboardingCompleted={onboardingCompleted}
            setCurrentStep={setOnboardingStep}
            setNavigationDirection={setNavigationDirection}
            totalStepsCount={steps.length}
          />
        </div>
      </Container>
    </div>
  )
}
