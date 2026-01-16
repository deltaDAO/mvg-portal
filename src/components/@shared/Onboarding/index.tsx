import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../atoms/Container'
import Stepper from './Stepper'
import OnboardingApp from './Steps/OnboardingApp'
import Ready from './Steps/Ready'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { useUserPreferences } from '@context/UserPreferences'
import useBalance from '@hooks/useBalance'
import { getSupportedChainIds } from '../../../../chains.config'
import ImportWallet from './Steps/ImportWallet'

export interface OnboardingStep {
  title: string
  subtitle: string
  body: string
  image?: string
  buttonLabel?: string
  buttonSuccess?: string
}

const steps = [
  { shortLabel: 'Onboarding', component: <OnboardingApp /> },
  { shortLabel: 'Connect', component: <ImportWallet /> },
  { shortLabel: 'Ready', component: <Ready /> }
]

export enum NavigationDirections {
  PREV = 'prev',
  NEXT = 'next'
}

export default function OnboardingSection({
  showHideButton
}: {
  showHideButton?: boolean
}): ReactElement {
  const { address: accountId } = useAccount()
  const { balance } = useBalance()
  const web3Provider = useProvider()
  const { chain } = useNetwork()
  const { onboardingStep, setOnboardingStep } = useUserPreferences()
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [navigationDirection, setNavigationDirection] =
    useState<NavigationDirections>()
  const stepLabels = steps.map((step) => step.shortLabel)

  useEffect(() => {
    if (onboardingStep > steps.length) setOnboardingStep(0)
  }, [onboardingStep, setOnboardingStep])

  useEffect(() => {
    if (
      accountId &&
      web3Provider &&
      getSupportedChainIds().includes(chain?.id)
    ) {
      setOnboardingCompleted(true)
    }
  }, [accountId, balance, chain?.id, web3Provider])

  return (
    <div className={styles.wrapper}>
      <Header showHideButton={showHideButton} />
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
