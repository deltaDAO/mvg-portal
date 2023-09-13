import { ethers } from 'ethers'
import React, { ReactElement, useCallback, useEffect } from 'react'
import {
  erc20ABI,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button from '../../../@shared/atoms/Button'
import Loader from '../../../@shared/atoms/Loader'
import { toast } from 'react-toastify'

export default function ApproveToken({
  token,
  amount
}: {
  token: {
    address: `0x${string}`
    symbol: string
    decimals: number
  }
  amount: string
}): ReactElement {
  const { autoWallet, updateBalance } = useAutomation()

  const { config } = usePrepareContractWrite({
    address: token.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      autoWallet?.wallet?.address as `0x${string}`,
      ethers.utils.parseUnits(amount, token.decimals)
    ]
  })
  const { data, write, isLoading, isError } = useContractWrite(config)

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError
  } = useWaitForTransaction({
    hash: data?.hash
  })

  const approveToken = async () => {
    write?.()
  }

  const informUser = useCallback(
    (success = true) => {
      if (success)
        toast.success(`Successfully approved ${amount} ${token.symbol}.`)
      else toast.error(`Could not approve ${token.symbol}. Please try again.`)
    },
    [amount, token?.symbol]
  )

  /**
   * Update balance once successfully approved tokens
   */
  useEffect(() => {
    if (!isTransactionSuccess) return

    const updateBalanceAndInformUser = async () => {
      await updateBalance()
      informUser(true)
    }

    updateBalanceAndInformUser()
  }, [isTransactionSuccess, updateBalance, informUser])

  /**
   * Inform user on error
   */
  useEffect(() => {
    if (isError || isTransactionError) informUser(false)
  }, [isError, isTransactionError, informUser])

  return (
    <Button
      style="text"
      disabled={
        !autoWallet?.wallet ||
        !token?.address ||
        isLoading ||
        isTransactionLoading
      }
      onClick={(e) => {
        e.preventDefault()
        approveToken()
      }}
    >
      {isLoading || isTransactionLoading ? (
        <Loader
          message={isLoading ? 'Awaiting approval' : 'Waiting for transaction'}
        />
      ) : (
        <span>
          Approve {amount} {token.symbol}
        </span>
      )}
    </Button>
  )
}
