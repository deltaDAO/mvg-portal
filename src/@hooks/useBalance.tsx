import { useState, useEffect, useCallback } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { useMarketMetadata } from '../@context/MarketMetadata'
import {
  useNetwork,
  useAccount,
  useProvider,
  useBalance as useBalanceWagmi
} from 'wagmi'
import { getTokenBalance } from '@utils/wallet'

interface BalanceProviderValue {
  balance: UserBalance
  getApprovedTokenBalances: (address: string) => Promise<UserBalance>
}

function useBalance(): BalanceProviderValue {
  const { address } = useAccount()
  const { data: balanceNativeToken } = useBalanceWagmi({ address })
  const web3provider = useProvider()
  const { approvedBaseTokens } = useMarketMetadata()
  const { chain } = useNetwork()

  const [balance, setBalance] = useState<UserBalance>({
    eth: '0'
  })

  const getApprovedTokenBalances = useCallback(
    async (address: string): Promise<UserBalance> => {
      const newBalance: UserBalance = {}

      if (approvedBaseTokens?.length > 0) {
        await Promise.allSettled(
          approvedBaseTokens.map(async (token) => {
            const { address: tokenAddress, decimals, symbol } = token
            const tokenBalance = await getTokenBalance(
              address,
              decimals,
              tokenAddress,
              web3provider
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
    if (
      !balanceNativeToken?.formatted ||
      !address ||
      !chain?.id ||
      !web3provider
    )
      return

    try {
      const userBalance = balanceNativeToken?.formatted
      const key = balanceNativeToken?.symbol.toLowerCase()
      const newNativeBalance: UserBalance = { [key]: userBalance }

      const newBalance = {
        ...newNativeBalance,
        ...(await getApprovedTokenBalances(address))
      }

      setBalance(newBalance)
      LoggerInstance.log('[useBalance] Balance: ', newBalance)
    } catch (error) {
      LoggerInstance.error('[useBalance] Error: ', error.message)
    }
  }, [
    address,
    chain?.id,
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
