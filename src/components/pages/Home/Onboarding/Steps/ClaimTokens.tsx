import axios from 'axios'
import React, { ReactElement, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import { useWeb3 } from '../../../../../providers/Web3'
import StepActions from '../../../../organisms/Onboarding/StepActions'
import StepBody from '../../../../organisms/Onboarding/StepBody'
import StepHeader from '../../../../organisms/Onboarding/StepHeader'

export default function ClaimTokens({
  title,
  subtitle,
  body,
  image
}: OnboardingStep): ReactElement {
  const { accountId, balance, networkId } = useWeb3()
  const [loading, setLoading] = useState({ gx: false, ocean: false })
  const [completed, setCompleted] = useState({ gx: false, ocean: false })

  useEffect(() => {
    if (networkId !== 2021000) {
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
      <StepBody body={body} image={image.childImageSharp.original.src}>
        <StepActions
          buttonLabel="Claim 1 GX"
          buttonAction={async () => await claimTokens(accountId, 'gx')}
          successMessage="Successfully claimed 1 GX"
          loading={loading?.gx}
          completed={completed?.gx}
        />
        <StepActions
          buttonLabel="Claim 100 OCEAN"
          buttonAction={async () => await claimTokens(accountId, 'ocean')}
          successMessage="Successfully claimed 100 OCEAN"
          loading={loading?.gx}
          completed={completed?.gx}
        />
      </StepBody>
    </div>
  )
}
