import { ReactElement } from 'react'
import { OnboardingStep } from '..'
import content from '../../../../../content/onboarding/steps/faucet.json'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
export default function Faucet(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content

  const actions = [
    {
      buttonLabel: 'Request Test Sepolia Tokens',
      buttonAction: async () => {
        window.open(
          'https://cloud.google.com/application/web3/faucet/ethereum/sepolia',
          '_blank'
        )
      },
      successMessage: 'Successfully requested test tokens.'
    },
    {
      buttonLabel: 'Request Test OCEAN Tokens',
      buttonAction: async () => {
        window.open('https://faucet.sepolia.oceanprotocol.com', '_blank')
      },
      successMessage: 'Successfully requested test tokens.'
    }
  ]

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
