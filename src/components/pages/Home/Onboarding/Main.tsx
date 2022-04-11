import React, { ReactElement } from 'react'
import Button from '../../../atoms/Button'
import Markdown from '../../../atoms/Markdown'
import styles from './Main.module.css'
import { CurrentStepStatus, OnboardingStep } from './index'
import { useWeb3 } from '../../../../providers/Web3'
import useNetworkMetadata from '../../../../hooks/useNetworkMetadata'
import { addCustomNetwork, addTokenToWallet } from '../../../../utils/web3'
import { getOceanConfig } from '../../../../utils/ocean'
import axios from 'axios'

export default function Main({
  currentStep = 0,
  currentStepStatus,
  setCurrentStepStatus,
  steps
}: {
  currentStep: number
  currentStepStatus: CurrentStepStatus
  setCurrentStepStatus: (status: CurrentStepStatus) => void
  steps: OnboardingStep[]
}): ReactElement {
  const { accountId, connect, networkId, web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()

  const mainActions = {
    downloadMetaMask: () =>
      window.open(
        'https://metamask.io/download/',
        '_blank',
        'noopener noreferrer'
      ),
    connectAccount: async () => await connect(),
    connectNetwork: async () => {
      const networkNode = await networksList.find(
        (data) => data.node.chainId === 2021000
      ).node
      addCustomNetwork(web3Provider, networkNode)
    },
    importOceanToken: async () => {
      const oceanConfig = getOceanConfig(networkId)
      await addTokenToWallet(
        web3Provider,
        oceanConfig?.oceanTokenAddress,
        oceanConfig.oceanTokenSymbol,
        'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'
      )
    },
    claimGxToken: async () => {
      await axios.get('https://faucet.gx.gaiaxtestnet.oceanprotocol.com/send', {
        params: { address: accountId }
      })
    },
    claimOceanTokens: async () => {
      await axios.get('https://faucet.gaiaxtestnet.oceanprotocol.com/send', {
        params: { address: accountId }
      })
    }
  }

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
                  <Button
                    key={i}
                    style="primary"
                    onClick={mainActions?.[e.ctaAction]}
                  >
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
