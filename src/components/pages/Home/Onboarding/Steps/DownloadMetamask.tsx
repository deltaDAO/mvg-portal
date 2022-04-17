import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

const query = graphql`
  query DownloadMetaMaskQuery {
    file(
      relativePath: { eq: "pages/index/onboarding/steps/downloadMetaMask.json" }
    ) {
      childStepsJson {
        title
        subtitle
        body
        image {
          childImageSharp {
            original {
              src
            }
          }
        }
        buttonLabel
      }
    }
  }
`

export default function DownloadMetamask(): ReactElement {
  const data = useStaticQuery(query)
  const { title, subtitle, body, image, buttonLabel }: OnboardingStep =
    data.file.childStepsJson

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
          buttonLabel={buttonLabel}
          buttonAction={() => downloadMetamask()}
          loading={false}
          completed={false}
        />
      </StepBody>
    </div>
  )
}
