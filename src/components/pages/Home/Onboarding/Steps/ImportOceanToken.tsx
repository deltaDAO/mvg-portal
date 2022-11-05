import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { GEN_X_NETWORK_ID } from '../../../../../../chains.config'
import { useWeb3 } from '../../../../../providers/Web3'
import { getOceanConfig } from '../../../../../utils/ocean'
import { getErrorMessage } from '../../../../../utils/onboarding'
import { addTokenToWallet } from '../../../../../utils/web3'
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

  const { accountId, web3Provider, networkId } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const importOceanToken = async () => {
    setLoading(true)
    try {
      if (networkId !== GEN_X_NETWORK_ID) throw new Error()
      const oceanConfig = getOceanConfig(networkId)
      await addTokenToWallet(
        web3Provider,
        oceanConfig?.oceanTokenAddress,
        oceanConfig.oceanTokenSymbol,
        'https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png'
      )
      setCompleted(true)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId
        })
      )
      if (error.message) console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    {
      buttonLabel,
      buttonAction: async () => await importOceanToken(),
      successMessage: buttonSuccess,
      loading: loading,
      completed: completed
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
