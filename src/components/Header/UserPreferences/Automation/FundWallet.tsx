import { BigNumber, ethers } from 'ethers'
import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import {
  useAccount,
  useBalance,
  usePrepareSendTransaction,
  useSendTransaction,
  useWaitForTransaction
} from 'wagmi'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button, { ButtonProps } from '../../../@shared/atoms/Button'
import { useMarketMetadata } from '../../../../@context/MarketMetadata'
import { toast } from 'react-toastify'
import Loader from '../../../@shared/atoms/Loader'
import useTokenApproval from '../../../../@hooks/useTokenApproval'

export default function FundWallet({
  style = 'text',
  children,
  className
}: {
  style?: ButtonProps['style']
  children?: ReactNode
  className?: string
}): ReactElement {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { autoWallet, updateBalance } = useAutomation()
  const { automationConfig } = useMarketMetadata().appConfig
  const { approve, setValue, isLoading: isApprovalLoading } = useTokenApproval()

  const [balanceToFund, setBalanceToFund] = useState<BigNumber>()

  useEffect(() => {
    if (!balance || !automationConfig.networkTokenFundDefaultValue) return

    const defaultValue = automationConfig.networkTokenFundDefaultValue

    const newFundingBalance =
      Number(defaultValue) > Number(balance.formatted)
        ? (Number(balance.formatted) * 0.5).toString()
        : defaultValue

    console.log('BALANCE', { balance, defaultValue, newFundingBalance })

    setBalanceToFund(ethers.utils.parseEther(newFundingBalance))
  }, [balance, automationConfig?.networkTokenFundDefaultValue])

  /**
   * SEND NETWORK TOKEN
   */
  const { config } = usePrepareSendTransaction({
    request: {
      to: autoWallet?.address,
      value: balanceToFund
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

    if (automationConfig.useAutomationForErc20 === 'true') approve()
  }

  return (
    <Button
      style={style}
      disabled={isLoading || isTransactionLoading || isApprovalLoading}
      onClick={() => fundWallet()}
      className={className}
    >
      {isLoading || isTransactionLoading || isApprovalLoading ? (
        <Loader message="Awaiting transactions" />
      ) : (
        children || `Fund automation wallet`
      )}
    </Button>
  )
}
