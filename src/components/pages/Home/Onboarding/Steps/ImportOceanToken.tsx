import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { useWeb3 } from '../../../../../providers/Web3'
import { getOceanConfig } from '../../../../../utils/ocean'
import { addTokenToWallet } from '../../../../../utils/web3'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

const query = graphql`
  query ImportOceanTokenQuery {
    file(
      relativePath: { eq: "pages/index/onboarding/steps/importOceanToken.json" }
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
        buttonSuccess
      }
    }
  }
`

export default function ImportOceanToken(): ReactElement {
  const data = useStaticQuery(query)
  const {
    title,
    subtitle,
    body,
    image,
    buttonLabel,
    buttonSuccess
  }: OnboardingStep = data.file.childStepsJson

  const { web3Provider, networkId } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const importOceanToken = async () => {
    setLoading(true)
    try {
      const oceanConfig = getOceanConfig(networkId)
      await addTokenToWallet(
        web3Provider,
        oceanConfig?.oceanTokenAddress,
        oceanConfig.oceanTokenSymbol,
        'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'
      )
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setCompleted(true)
      setLoading(false)
    }
  }
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image.childImageSharp.original.src}>
        <StepActions
          buttonLabel={buttonLabel}
          buttonAction={async () => await importOceanToken()}
          successMessage={buttonSuccess}
          loading={loading}
          completed={completed}
        />
      </StepBody>
    </div>
  )
}
