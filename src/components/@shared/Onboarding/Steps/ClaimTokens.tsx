import { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/claimTokens.json'

export default function ClaimTokens(): ReactElement {
  const { title, subtitle, body, image, buttonLabel }: OnboardingStep = content

  const actions = [
    {
      buttonLabel,
      buttonAction: () => {
        const anchor = document.createElement('a')
        anchor.href = 'https://faucet.genx.minimal-gaia-x.eu'
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer'
        anchor.click()
      },
      loading: false,
      completed: false
    }
  ]

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
