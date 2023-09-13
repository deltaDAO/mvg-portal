import { ethers } from 'ethers'
import React, { ReactElement, useEffect, useState } from 'react'
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite
} from 'wagmi'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import { getOceanConfig } from '../../../@utils/ocean'
import Button from '../../@shared/atoms/Button'

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
  const { autoWallet } = useAutomation()

  const { config } = usePrepareContractWrite({
    address: token.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      autoWallet?.wallet?.address as `0x${string}`,
      ethers.utils.parseUnits(amount, token.decimals)
    ]
  })
  const { write } = useContractWrite(config)

  return (
    <Button
      style="text"
      disabled={!autoWallet?.wallet || !token?.address}
      onClick={(e) => {
        e.preventDefault()
        write?.()
      }}
    >
      Approve {amount} {token.symbol}
    </Button>
  )
}
