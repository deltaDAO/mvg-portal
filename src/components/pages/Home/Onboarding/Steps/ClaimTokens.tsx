import { graphql, useStaticQuery } from 'gatsby'
import axios from 'axios'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { useWeb3 } from '../../../../../providers/Web3'
import StepAction from '../../../../organisms/Onboarding/StepAction'
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
        buttons {
          label
          balance
          success
          key
        }
      }
    }
  }
`

export enum Tokens {
  GX = 'gx',
  OCEAN = 'ocean'
}

type ClaimTokensStep<T> = Partial<T> & {
  buttons: {
    label: string
    balance: string
    success: string
    key: Tokens
  }[]
}

export default function ClaimTokens(): ReactElement {
  const data = useStaticQuery(query)
  const {
    title,
    subtitle,
    body,
    image,
    buttons
  }: ClaimTokensStep<OnboardingStep> = data.file.childStepsJson

  const { accountId, balance, networkId, web3Provider } = useWeb3()
  const [tokenState, setTokenState] = useState({
    [Tokens.GX]: { loading: false, touched: false, completed: false },
    [Tokens.OCEAN]: { loading: false, touched: false, completed: false }
  })

  useEffect(() => {
    if (networkId !== GX_NETWORK_ID) {
      setTokenState({
        [Tokens.GX]: { ...tokenState.gx, completed: false },
        [Tokens.OCEAN]: { ...tokenState.ocean, completed: false }
      })
      return
    }

    setTokenState({
      [Tokens.GX]: { ...tokenState.gx, completed: Number(balance?.eth) > 0 },
      [Tokens.OCEAN]: {
        ...tokenState.ocean,
        completed: Number(balance?.ocean) > 0
      }
    })
  }, [accountId, balance, networkId])

  const claimTokens = async (address: string, token: Tokens) => {
    if (networkId !== GX_NETWORK_ID) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId,
          balance: null
        })
      )
    }

    setTokenState({
      ...tokenState,
      [token]: { ...tokenState[token], loading: true, touched: true }
    })
    const baseUrl =
      token === Tokens.GX
        ? 'https://faucet.gx.gaiaxtestnet.oceanprotocol.com/send'
        : 'https://faucet.gaiaxtestnet.oceanprotocol.com/send'

    try {
      await axios.get(baseUrl, {
        params: { address }
      })
    } catch {
      // Workaround until we deploy our own faucet:
      // the api call is going to fail due to a CORS error but the tokens are
      // sent anyway so we set the new token state in the catch
      setTokenState({
        ...tokenState,
        [token]: {
          ...tokenState[token],
          completed: true,
          touched: true,
          loading: false
        }
      })
    }
  }

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image.childImageSharp.original.src}>
        {buttons?.map((button) => (
          <StepAction
            key={button.key}
            buttonLabel={button.label}
            buttonAction={async () => await claimTokens(accountId, button.key)}
            successMessage={
              tokenState[button.key].touched ? button.success : button.balance
            }
            loading={tokenState[button.key].loading}
            completed={tokenState[button.key].completed}
          />
        ))}
      </StepBody>
    </div>
  )
}
