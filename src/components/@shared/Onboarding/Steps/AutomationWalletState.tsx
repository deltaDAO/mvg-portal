import React, { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/automationWalletState.json'

export default function AutomationWalletState(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} />
    </div>
  )
}
