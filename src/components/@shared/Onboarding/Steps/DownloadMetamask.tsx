import { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/downloadMetamask.json'

export default function DownloadMetamask(): ReactElement {
  const { title, subtitle, body, image, buttonLabel }: OnboardingStep = content

  const downloadMetamask = () =>
    window.open(
      'https://metamask.io/download/',
      '_blank',
      'noopener noreferrer'
    )

  const actions = [
    {
      buttonLabel,
      buttonAction: () => downloadMetamask(),
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
