import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement } from 'react'
import { OnboardingStep } from '..'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

const query = graphql`
  query ClaimTokensQuery {
    file(
      relativePath: { eq: "pages/index/onboarding/steps/claimTokens.json" }
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

export enum Tokens {
  GX = 'gx',
  OCEAN = 'ocean'
}

export default function ClaimTokens(): ReactElement {
  const data = useStaticQuery(query)
  const { title, subtitle, body, image, buttonLabel }: OnboardingStep =
    data.file.childStepsJson

  const actions = [
    {
      buttonLabel,
      buttonAction: () => {
        const anchor = document.createElement('a')
        anchor.href = 'mailto:contact@delta-dao.com'
        anchor.click()
      },
      loading: false,
      completed: false
    }
  ]

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody
        body={body}
        image={image.childImageSharp.original.src}
        actions={actions}
      />
    </div>
  )
}
