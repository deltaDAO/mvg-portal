import { ethers } from 'ethers'
import React, { ReactElement } from 'react'
import { usePrepareSendTransaction, useSendTransaction } from 'wagmi'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button from '../../../@shared/atoms/Button'

export default function SendTransaction(): ReactElement {
  const { autoWallet } = useAutomation()
  const { config } = usePrepareSendTransaction({
    request: {
      to: autoWallet?.wallet?.address,
      value: ethers.utils.parseEther('1')
    }
  })
  const { data, isLoading, isSuccess, sendTransaction } =
    useSendTransaction(config)

  return (
    <Button
      style="text"
      disabled={!sendTransaction}
      onClick={() => sendTransaction?.()}
    >
      Send 1 Ether
    </Button>
  )
}
