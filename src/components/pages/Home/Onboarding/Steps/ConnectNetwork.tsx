import { graphql, useStaticQuery } from 'gatsby'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import useNetworkMetadata from '../../../../../hooks/useNetworkMetadata'
import { useWeb3 } from '../../../../../providers/Web3'
import { addCustomNetwork } from '../../../../../utils/web3'
import StepActions from '../../../../organisms/Onboarding/StepActions'
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

  const { accountId, web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    if (accountId && !!web3Provider) {
      setCompleted(true)
    } else {
      setCompleted(false)
    }
  }, [accountId, web3Provider])

  const connectNetwork = async () => {
    setLoading(true)
    try {
      const networkNode = await networksList.find(
        (data) => data.node.chainId === 2021000
      ).node
      addCustomNetwork(web3Provider, networkNode)
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image.childImageSharp.original.src}>
        <StepActions
          buttonLabel={buttonLabel}
          buttonAction={async () => await connectNetwork()}
          successMessage={buttonSuccess}
          loading={loading}
          completed={completed}
        />
      </StepBody>
    </div>
  )
}
