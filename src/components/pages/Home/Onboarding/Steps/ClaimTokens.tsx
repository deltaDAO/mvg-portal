import { graphql, useStaticQuery } from 'gatsby'
import axios from 'axios'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { useWeb3 } from '../../../../../providers/Web3'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'
import { GX_NETWORK_ID } from '../../../../../../chains.config'

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
        gxButtonLabel
        gxSuccess
        oceanButtonLabel
        oceanSuccess
      }
    }
  }
`

type ClaimTokensStep<T> = Partial<T> & {
  gxButtonLabel: string
  gxSuccess: string
  oceanButtonLabel: string
  oceanSuccess: string
}

export default function ClaimTokens(): ReactElement {
  const data = useStaticQuery(query)
  const {
    title,
    subtitle,
    body,
    gxButtonLabel,
    gxSuccess,
    oceanButtonLabel,
    oceanSuccess
  }: ClaimTokensStep<OnboardingStep> = data.file.childStepsJson

  const { accountId, balance, networkId } = useWeb3()
  const [loading, setLoading] = useState({ gx: false, ocean: false })
  const [completed, setCompleted] = useState({ gx: false, ocean: false })

  useEffect(() => {
    if (networkId !== GX_NETWORK_ID) {
      setCompleted({ gx: false, ocean: false })
      return
    }

    if (Number(balance?.eth) > 0) setCompleted({ ...completed, gx: true })
    if (Number(balance?.ocean) > 0) setCompleted({ ...completed, ocean: true })
  }, [accountId, balance, networkId])

  const claimTokens = async (address: string, token: 'gx' | 'ocean') => {
    setLoading({ ...loading, [token]: true })
    const baseUrl =
      token === 'gx'
        ? 'https://faucet.gx.gaiaxtestnet.oceanprotocol.com/send'
        : 'https://faucet.gaiaxtestnet.oceanprotocol.com/send'
    try {
      await axios.get(baseUrl, {
        params: { address }
      })
      setCompleted({ ...completed, [token]: true })
    } catch (error) {
      toast.error('Looks like something went wrong, please try again.')
      console.error(error.message)
    } finally {
      setLoading({ ...loading, [token]: false })
    }
  }
  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body}>
        <StepActions
          buttonLabel={gxButtonLabel}
          buttonAction={async () => await claimTokens(accountId, 'gx')}
          successMessage={gxSuccess}
          loading={loading?.gx}
          completed={completed?.gx}
        />
        <StepActions
          buttonLabel={oceanButtonLabel}
          buttonAction={async () => await claimTokens(accountId, 'ocean')}
          successMessage={oceanSuccess}
          loading={loading?.ocean}
          completed={completed?.ocean}
        />
      </StepBody>
    </div>
  )
}
