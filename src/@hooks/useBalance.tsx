import { useState, useEffect, useCallback } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useMarketMetadata } from '../@context/MarketMetadata'
import {
  useChainId,
  useAccount,
  usePublicClient,
  useBalance as useBalanceWagmi
} from 'wagmi'
import { getTokenBalance } from '@utils/wallet'
import { BrowserProvider } from 'ethers'
import { custom } from 'viem'

interface BalanceProviderValue {
  balance: UserBalance
  getApprovedTokenBalances: (address: string) => Promise<TokenBalances>
}

function useBalance(): BalanceProviderValue {
  const { address } = useAccount()
  const { data: balanceNativeToken } = useBalanceWagmi({ address })

  const chainId = useChainId()
  const viemPublicClient = usePublicClient({ chainId })
  const web3provider = viemPublicClient
    ? new BrowserProvider(custom(viemPublicClient.transport) as any)
    : undefined

  const { approvedBaseTokens } = useMarketMetadata()

  const [balance, setBalance] = useState<UserBalance>({
    native: {
      symbol: 'eth',
      balance: '0'
    }
  })

  const getApprovedTokenBalances = useCallback(
    async (address: string): Promise<TokenBalances> => {
      const newBalance: TokenBalances = {}

      if (approvedBaseTokens?.length > 0) {
        await Promise.allSettled(
          approvedBaseTokens.map(async (token) => {
            const { address: tokenAddress, decimals, symbol } = token
            const tokenBalance = await getTokenBalance(
              address,
              decimals,
              tokenAddress,
              web3provider as any
            )
            newBalance[symbol.toLocaleLowerCase()] = tokenBalance
          })
        )
      }

      return newBalance
    },
    [approvedBaseTokens, web3provider]
  )

  // -----------------------------------
  // Helper: Get user balance
  // -----------------------------------
  const getUserBalance = useCallback(async () => {
    if (!balanceNativeToken?.formatted || !address || !chainId || !web3provider)
      return

    try {
      const userBalance = balanceNativeToken?.formatted
      const key = balanceNativeToken?.symbol.toLowerCase()

      const newBalance: UserBalance = {
        native: {
          symbol: key,
          balance: userBalance
        },
        approved: await getApprovedTokenBalances(address)
      }
      console.log('user balance', newBalance)
      setBalance(newBalance)
    } catch (error: any) {
      LoggerInstance.error('[useBalance] Error: ', error.message)
    }
  }, [
    address,
    chainId,
    web3provider,
    balanceNativeToken,
    getApprovedTokenBalances
  ])

  useEffect(() => {
    getUserBalance()
  }, [getUserBalance])

  return { balance, getApprovedTokenBalances }
}

export default useBalance
