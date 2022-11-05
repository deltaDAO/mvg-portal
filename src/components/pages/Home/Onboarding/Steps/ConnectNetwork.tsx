import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { GEN_X_NETWORK_ID } from '../../../../../../chains.config'
import useNetworkMetadata from '../../../../../hooks/useNetworkMetadata'
import { useWeb3 } from '../../../../../providers/Web3'
import { getErrorMessage } from '../../../../../utils/onboarding'
import { addCustomNetwork } from '../../../../../utils/web3'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

const query = graphql`
  query ConnectNetworkQuery {
    file(
      relativePath: { eq: "pages/index/onboarding/steps/connectNetwork.json" }
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

export default function ConnectNetwork(): ReactElement {
  const data = useStaticQuery(query)
  const {
    title,
    subtitle,
    body,
    image,
    buttonLabel,
    buttonSuccess
  }: OnboardingStep = data.file.childStepsJson

  const { accountId, networkId, web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (accountId && !!web3Provider && networkId === GEN_X_NETWORK_ID) {
      setCompleted(true)
    } else {
      setCompleted(false)
    }
  }, [accountId, web3Provider, networkId])

  const connectNetwork = async () => {
    setLoading(true)
    try {
      const networkNode = await networksList.find(
        (data) => data.node.chainId === GEN_X_NETWORK_ID
      ).node
      addCustomNetwork(web3Provider, networkNode)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId
        })
      )
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = [
    {
      buttonLabel,
      buttonAction: async () => await connectNetwork(),
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
