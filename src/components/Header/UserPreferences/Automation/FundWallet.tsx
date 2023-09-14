import { ethers } from 'ethers'
import React, { ReactElement, useEffect } from 'react'
import {
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction
} from 'wagmi'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button from '../../../@shared/atoms/Button'
import { useMarketMetadata } from '../../../../@context/MarketMetadata'
import { toast } from 'react-toastify'
import Loader from '../../../@shared/atoms/Loader'
import useTokenApproval from '../../../../@hooks/useTokenApproval'

export default function FundWallet({
  className
}: {
  className: string
}): ReactElement {
  const { autoWallet, updateBalance } = useAutomation()
  const { automationConfig } = useMarketMetadata().appConfig
  const { approve, setValue, isLoading: isApprovalLoading } = useTokenApproval()

  /**
   * SEND NETWORK TOKEN
   */
  const { config } = usePrepareSendTransaction({
    request: {
      to: autoWallet?.wallet?.address,
      value: ethers.utils.parseEther(
        automationConfig.networkTokenFundDefaultValue
      )
    }
  })
  const { isLoading, sendTransaction, isError } = useSendTransaction(config)
  const {
    isLoading: isTransactionLoading,
    isError: isTransactionError,
    isSuccess: isTransactionSuccess
  } = useWaitForTransaction()

  useEffect(() => {
    setValue(automationConfig.erc20ApprovalDefaultValue)
  }, [setValue, automationConfig?.erc20ApprovalDefaultValue])

  useEffect(() => {
    const success = async () => {
      if (isTransactionSuccess) {
        await updateBalance()
        toast.success('Successfully transferred network tokens.')
      }
    }
    success()
  }, [isTransactionSuccess, updateBalance])

  useEffect(() => {
    if (isError || isTransactionError)
      toast.error('Could not transfer network tokens. Please try again.')
  }, [isError, isTransactionError])

  const fundWallet = () => {
    sendTransaction?.()
    approve()
  }

  return (
    <Button
      style="text"
      disabled={isLoading || isTransactionLoading || isApprovalLoading}
      onClick={() => fundWallet()}
      className={className}
    >
      {isLoading || isTransactionLoading || isApprovalLoading ? (
        <Loader message="Awaiting transactions" />
      ) : (
        `Fund automation wallet`
      )}
    </Button>
  )
}
