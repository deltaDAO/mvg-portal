import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button, { ButtonProps } from '../../../@shared/atoms/Button'
import { ethers } from 'ethers'
import Loader from '../../../@shared/atoms/Loader'
import useTokenApproval from '../../../../@hooks/useTokenApproval'
import { automationConfig } from '../../../../../app.config'

export default function WithdrawToken({
  style = 'text',
  children,
  className
}: {
  style?: ButtonProps['style']
  children?: ReactNode
  className?: string
}): ReactElement {
  const {
    autoWallet,
    balance,
    updateBalance,
    hasRetrievableBalance,
    hasAnyAllowance
  } = useAutomation()
  const { approve, setValue, isLoading: isApprovalLoading } = useTokenApproval()

  const [disabled, setDisabled] = useState<boolean>()
  const [isTxLoading, setIsTxLoading] = useState<boolean>()
  const [isTransactionSuccess, setIsTransactionSuccess] =
    useState<boolean>(undefined)

  useEffect(() => {
    const disable = async () => {
      const hasBalance = await hasRetrievableBalance()
      const hasAllowances = hasAnyAllowance()

      setDisabled(
        (!hasBalance && !hasAllowances) || isTxLoading || isApprovalLoading
      )
    }
    disable()
  }, [isTxLoading, isApprovalLoading, hasRetrievableBalance, hasAnyAllowance])

  const revokeApprovals = async () => {
    setValue('0')
    approve()
  }

  const sendBalance = async () => {
    try {
      if (!autoWallet) return

      if (!hasRetrievableBalance) {
        toast.error('Could not withdraw network token. Balance too low.')
        return
      }

      setIsTxLoading(true)
      const ethBalance = ethers.utils.parseEther(balance.eth)
      const estimatedGas = await autoWallet.wallet.estimateGas({
        to: autoWallet.address,
        value: ethBalance
      })
      const gasPrice = await autoWallet.wallet.getGasPrice()

      const retrievableEthValue = ethBalance.sub(estimatedGas.mul(gasPrice))
      const tx = await autoWallet.wallet.sendTransaction({
        to: autoWallet.address,
        value: retrievableEthValue
      })

      const approvedTx = await tx.wait()

      setIsTransactionSuccess(!!approvedTx?.transactionHash)
      setIsTxLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (isTransactionSuccess === false) {
      toast.error('Could not transfer network tokens. Please try again.')
      return
    }

    const success = async () => {
      if (isTransactionSuccess) {
        await updateBalance()
        toast.success('Successfully transferred network tokens.')
      }
    }
    success()
  }, [isTransactionSuccess, updateBalance])

  const withdraw = async () => {
    const hasBalance = await hasRetrievableBalance()
    const hasAllowances = hasAnyAllowance()

    if (!hasBalance && !hasAllowances) return

    if (hasBalance) sendBalance()
    if (hasAllowances) revokeApprovals()
  }

  return (
    <Button
      style={style}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault()
        withdraw()
      }}
      className={className}
    >
      {isApprovalLoading || isTxLoading ? (
        <Loader message="Awaiting transactions" />
      ) : (
        children || `Withdraw all tokens`
      )}
    </Button>
  )
}
