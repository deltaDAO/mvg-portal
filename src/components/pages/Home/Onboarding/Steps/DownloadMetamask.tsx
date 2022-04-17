import React, { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

export default function DownloadMetamask({
  title,
  subtitle,
  body,
  image
}: OnboardingStep): ReactElement {
  const downloadMetamask = () =>
    window.open(
      'https://metamask.io/download/',
      '_blank',
      'noopener noreferrer'
    )
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image.childImageSharp.original.src}>
        <StepActions
          buttonLabel="Download MetaMask"
          buttonAction={() => downloadMetamask()}
          successMessage=""
          loading={false}
          completed={false}
        />
      </StepBody>
    </div>
  )
}
