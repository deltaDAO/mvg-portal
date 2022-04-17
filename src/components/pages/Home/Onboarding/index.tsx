import React, { ReactElement, useEffect, useState } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import styles from './index.module.css'
import Header from './Header'
import Main from './Main'
import Navigation from './Navigation'
import Container from '../../../atoms/Container'
import Stepper from './Stepper'
import useNetworkMetadata from '../../../../hooks/useNetworkMetadata'
import { useWeb3 } from '../../../../providers/Web3'
import { addCustomNetwork, addTokenToWallet } from '../../../../utils/web3'
import { getOceanConfig } from '../../../../utils/ocean'
import axios from 'axios'

const onboardingMainQuery = graphql`
  query onboardingMainQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/index/onboarding.json" } }
    ) {
      edges {
        node {
          childIndexJson {
            steps {
              shortLabel
              title
              subtitle
              body
              suggestion
              image {
                childImageSharp {
                  original {
                    src
                  }
                }
              }
              cta {
                label
                successMessage
                action
                touchRequired
              }
            }
          }
        }
      }
    }
  }
`

export interface OnboardingStep {
  shortLabel: string
  title: string
  subtitle?: string
  body?: string
  suggestion?: string
  image?: {
    childImageSharp: { original: { src: string } }
  }
  cta?: {
    label: string
    successMessage?: string
    action: string
    touchRequired: boolean
  }[]
}

export interface CurrentStepStatus {
  [key: string]: {
    completed: boolean
    loading: boolean
    touched: boolean
  }
}

export default function OnboardingSection(): ReactElement {
  const data = useStaticQuery(onboardingMainQuery)
  const {
    steps
  }: {
    steps: OnboardingStep[]
  } = data.content.edges[0].node.childIndexJson
  const stepLabels = steps?.map((step) => step.shortLabel)

  const [currentStep, setCurrentStep] = useState(0)
  const [stepStatus, setStepStatus] = useState<CurrentStepStatus>()

  useEffect(() => {
    if (steps.length === 0) return
    const status: CurrentStepStatus = {}
    steps.forEach((step) => {
      if (!step?.cta) {
        return
      }
      step.cta.forEach(
        (action) =>
          (status[action.action] = {
            completed: false,
            loading: false,
            touched: !action.touchRequired
          })
      )
    })
    setStepStatus(status)
  }, [steps])

  const { accountId, balance, connect, networkId, web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()

  const mainActions = {
    downloadMetaMask: {
      run: () =>
        window.open(
          'https://metamask.io/download/',
          '_blank',
          'noopener noreferrer'
        ),
      verify: () => {
        return true
      }
    },
    connectAccount: {
      run: async () => await connect(),
      verify: () => {
        return !!web3Provider
      }
    },
    connectNetwork: {
      run: async () => {
        const networkNode = await networksList.find(
          (data) => data.node.chainId === 2021000
        ).node
        addCustomNetwork(web3Provider, networkNode)
      },
      verify: () => {
        return networkId === 2021000
      }
    },
    importOceanToken: {
      run: async () => {
        const oceanConfig = getOceanConfig(networkId)
        await addTokenToWallet(
          web3Provider,
          oceanConfig?.oceanTokenAddress,
          oceanConfig.oceanTokenSymbol,
          'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'
        )
      },
      verify: () => {
        if (networkId !== 2021000) return false
        // currently there is no API to check which tokens have already been added to MetaMask
        return true
      }
    },
    claimGxToken: {
      run: async () => {
        await axios.get(
          'https://faucet.gx.gaiaxtestnet.oceanprotocol.com/send',
          {
            params: { address: accountId }
          }
        )
      },
      verify: () => {
        if (networkId !== 2021000) return false
        return Number(balance?.eth) > 0
      }
    },
    claimOceanTokens: {
      run: async () => {
        await axios.get('https://faucet.gaiaxtestnet.oceanprotocol.com/send', {
          params: { address: accountId }
        })
      },
      verify: () => {
        if (networkId !== 2021000) return false
        return Number(balance?.ocean) > 0
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <Header />
      {steps.length > 0 && (
        <Container className={styles.cardWrapper}>
          <div className={styles.cardContainer}>
            <Stepper stepLabels={stepLabels} currentStep={currentStep} />
            <Main
              currentStep={currentStep}
              mainActions={mainActions}
              stepStatus={stepStatus}
              setStepStatus={setStepStatus}
              steps={steps}
            />
            <Navigation
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalStepsCount={steps?.length}
            />
          </div>
        </Container>
      )}
    </div>
  )
}
