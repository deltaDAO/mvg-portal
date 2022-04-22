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
import { getErrorMessage } from '../../../../../utils/onboarding'

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

enum Tokens {
  GX = 'gx',
  OCEAN = 'ocean'
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

  const { accountId, balance, networkId, web3Provider } = useWeb3()
  const [loading, setLoading] = useState({
    [Tokens.GX]: false,
    [Tokens.OCEAN]: false
  })
  const [completed, setCompleted] = useState({
    [Tokens.GX]: false,
    [Tokens.OCEAN]: false
  })

  useEffect(() => {
    if (networkId !== GX_NETWORK_ID) {
      setCompleted({ [Tokens.GX]: false, [Tokens.OCEAN]: false })
      return
    }

    setCompleted({
      gx: Number(balance?.eth) > 0,
      ocean: Number(balance?.ocean) > 0
    })
  }, [accountId, balance, networkId])

  const claimTokens = async (address: string, token: Tokens) => {
    setLoading({ ...loading, [token]: true })

    const baseUrl =
      token === Tokens.GX
        ? 'https://faucet.gx.gaiaxtestnet.oceanprotocol.com/send'
        : 'https://faucet.gaiaxtestnet.oceanprotocol.com/send'
    try {
      if (networkId !== GX_NETWORK_ID) throw new Error()
      await axios.get(baseUrl, {
        params: { address }
      })
      setCompleted({ ...completed, [token]: true })
    } catch (error) {
      toast.error(
        getErrorMessage({ accountId, web3Provider: !!web3Provider, networkId })
      )
      if (error.message) console.error(error.message)
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
          buttonAction={async () => await claimTokens(accountId, Tokens.GX)}
          successMessage={gxSuccess}
          loading={loading?.gx}
          completed={completed?.gx}
        />
        <StepActions
          buttonLabel={oceanButtonLabel}
          buttonAction={async () => await claimTokens(accountId, Tokens.OCEAN)}
          successMessage={oceanSuccess}
          loading={loading?.ocean}
          completed={completed?.ocean}
        />
      </StepBody>
    </div>
  )
}
