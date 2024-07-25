import { ReactElement, useState } from 'react'
import { toast } from 'react-toastify'
import { OnboardingStep } from '..'
import StepBody from '../StepBody'
import StepHeader from '../StepHeader'
import content from '../../../../../content/onboarding/steps/importCustomTokens.json'
import { useAccount, useNetwork, useProvider } from 'wagmi'
import { addTokenToWallet } from '@utils/wallet'
import { getErrorMessage } from '@utils/onboarding'
import { tokenLogos } from '@components/Header/Wallet/AddTokenList'
import { useMarketMetadata } from '@context/MarketMetadata'
import { getSupportedChainIds } from '../../../../../chains.config'

export default function ImportCustomTokens(): ReactElement {
  const { title, subtitle, body, image }: OnboardingStep = content

  const { address: accountId } = useAccount()
  const web3Provider = useProvider()
  const { chain } = useNetwork()
  const { approvedBaseTokens } = useMarketMetadata()

  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const importCustomToken = async (
    web3Provider: any,
    tokenAddress: string,
    tokenSymbol: string,
    tokenDecimals: number,
    tokenLogo?: string
  ) => {
    setLoading(true)
    try {
      if (!getSupportedChainIds().includes(chain?.id))
        throw new Error(
          'The chain you are connected to with your wallet is not supported'
        )
      await addTokenToWallet(
        tokenAddress,
        tokenSymbol,
        tokenDecimals,
        tokenLogo
      )
      setCompleted(true)
    } catch (error) {
      toast.error(
        getErrorMessage({
          accountId,
          web3Provider: !!web3Provider,
          networkId: chain?.id
        })
      )
      if (error.message) console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const actions = approvedBaseTokens
    ?.filter((token) => token.symbol.toLowerCase().includes('euro'))
    .map((token) => ({
      buttonLabel: `Import ${token.symbol} Token`,
      buttonAction: async () => {
        await importCustomToken(
          web3Provider,
          token.address,
          token.symbol,
          token.decimals,
          tokenLogos?.[token.symbol]?.url
        )
      },
      successMessage: `Successfully imported ${token.symbol} test token`,
      loading,
      completed
    }))

  return (
    <div>
      <StepHeader title={title} subtitle={subtitle} />
      <StepBody body={body} image={image} actions={actions} />
    </div>
  )
}
