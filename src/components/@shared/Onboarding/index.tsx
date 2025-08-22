import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../atoms/Container'
import Stepper from './Stepper'
import DownloadMetamask from './Steps/DownloadMetamask'
import ConnectAccount from './Steps/ConnectAccount'
import ImportCustomTokens from './Steps/ImportCustomTokens'
import Ready from './Steps/Ready'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { useUserPreferences } from '@context/UserPreferences'
import useBalance from '@hooks/useBalance'
import ImportWallet from './Steps/ImportWallet'
import AutomationWalletState from './Steps/AutomationWalletState'
import { getSupportedChainIds } from '../../../../chains.config'
import Faucet from './Steps/Faucet'

export interface OnboardingStep {
  title: string
  subtitle: string
  body: string
  image?: string
  buttonLabel?: string
  buttonSuccess?: string
}

const steps = [
  { shortLabel: 'MetaMask', component: <DownloadMetamask /> },
  { shortLabel: 'Connect', component: <ConnectAccount /> },
  { shortLabel: 'Tokens', component: <ImportCustomTokens /> },
  { shortLabel: 'Import', component: <ImportWallet /> },
  { shortLabel: 'Automation', component: <AutomationWalletState /> },
  { shortLabel: 'Faucet', component: <Faucet /> },
  { shortLabel: 'Ready', component: <Ready /> }
]

export enum NavigationDirections {
  PREV = 'prev',
  NEXT = 'next'
}

export default function OnboardingSection(): ReactElement {
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
