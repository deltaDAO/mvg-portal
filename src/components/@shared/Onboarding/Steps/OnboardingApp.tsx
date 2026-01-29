import { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/onboardingApp.json'

export default function OnboardingApp(): ReactElement {
  const { title, subtitle, body, image, buttonLabel }: OnboardingStep = content

  const openOnboardingApp = () =>
    window.open(
      'https://onboarding.delta-dao.com/',
      '_blank',
      'noopener noreferrer'
    )

  const actions = [
    {
      buttonLabel,
      buttonAction: () => openOnboardingApp(),
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
