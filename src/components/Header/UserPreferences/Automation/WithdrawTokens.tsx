import React, {
  ComponentProps,
  ReactElement,
  ReactPropTypes,
  useEffect,
  useState
} from 'react'
import { toast } from 'react-toastify'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Button from '../../../@shared/atoms/Button'
import { ethers } from 'ethers'
import {
  erc20ABI,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { getOceanConfig } from '../../../../@utils/ocean'
import { tokenAddressesEUROe } from '../../../../@utils/subgraph'
import Loader from '../../../@shared/atoms/Loader'

export default function WithdrawToken({
  className
}: {
  className?: string
}): ReactElement {
  const { autoWallet, balance, updateBalance } = useAutomation()

  const chainId = useChainId()

  const [oceanTokenAddress, setOceanTokenAddress] = useState<`0x${string}`>()
  const [euroeTokenAddress, setEuroeTokenAddress] = useState<`0x${string}`>()

  const [isTransactionSuccess, setIsTransactionSuccess] =
    useState<boolean>(undefined)

  const [isLoading, setIsLoading] = useState<boolean>()
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>()

  useEffect(() => {
    const oceanConfig = getOceanConfig(chainId)
    setOceanTokenAddress(oceanConfig?.oceanTokenAddress as `0x${string}`)
    setEuroeTokenAddress(tokenAddressesEUROe[chainId] as `0x${string}`)
  }, [chainId])

  const { config: oceanConfig } = usePrepareContractWrite({
    address: oceanTokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      autoWallet?.wallet?.address as `0x${string}`,
      ethers.utils.parseUnits('0', 18)
    ]
  })
  const {
    data: oceanData,
    write: oceanWrite,
    isLoading: isOceanLoading
  } = useContractWrite(oceanConfig)

  const { config: euroeConfig } = usePrepareContractWrite({
    address: euroeTokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      autoWallet?.wallet?.address as `0x${string}`,
      ethers.utils.parseUnits('0', 18)
    ]
  })
  const {
    data: euroeData,
    write: euroeWrite,
    isLoading: isEuroeLoading
  } = useContractWrite(euroeConfig)

  const {
    isLoading: isOceanTransactionLoading,
    isSuccess: isOceanTransactionSuccess
  } = useWaitForTransaction({
    hash: oceanData?.hash
  })

  const {
    isLoading: isEuroeTransactionLoading,
    isSuccess: isEuroeTransactionSuccess
  } = useWaitForTransaction({
    hash: euroeData?.hash
  })

  const revokeApprovals = async () => {
    oceanWrite?.()
    euroeWrite?.()
  }

  const sendBalance = async () => {
    try {
      const ethBalance = ethers.utils.parseEther(balance.eth)

      const estimatedGas = await autoWallet.wallet.estimateGas({
        to: autoWallet.address,
        value: ethBalance
      })

      const gasPrice = await autoWallet.wallet.getGasPrice()

      if (estimatedGas.mul(gasPrice).gt(ethBalance)) {
        toast.error('Could not withdraw network token. Balance too low.')
        console.error('Network token balance is too low for withdrawal.')
        return
      }

      const retrievableEthValue = ethBalance.sub(estimatedGas.mul(gasPrice))
      const tx = await autoWallet.wallet.sendTransaction({
        to: autoWallet.address,
        value: retrievableEthValue
      })

      const approvedTx = await tx.wait()

      setIsTransactionSuccess(!!approvedTx?.transactionHash)
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * Handle balance update and user feedback
   */
  useEffect(() => {
    if (!isWithdrawing || isLoading) return

    const updateBalanceAndInformUser = async () => {
      const success = []
      const error = []

      if (isOceanTransactionSuccess) {
        success.push(`OCEAN`)
      } else {
        error.push(`OCEAN`)
      }
      if (isEuroeTransactionSuccess) {
        success.push(`EUROe`)
      } else {
        error.push(`EUROe`)
      }
      if (isTransactionSuccess) {
        success.push(`Network Token`)
      } else {
        error.push(`Network Token`)
      }

      await updateBalance()

      if (success.length > 0)
        toast.success(`Successfully withdrew ${success.join(', ')}.`)

      if (error.length > 0)
        toast.error(`Could not withdraw ${error.join(', ')}. Please try again.`)

      setIsWithdrawing(false)
    }

    updateBalanceAndInformUser()
  }, [
    isWithdrawing,
    isLoading,
    isEuroeTransactionSuccess,
    isOceanTransactionSuccess,
    isTransactionSuccess,
    updateBalance
  ])

  useEffect(() => {
    setIsLoading(
      isWithdrawing &&
        (isOceanLoading || isEuroeLoading || isTransactionSuccess === undefined)
    )
  }, [isWithdrawing, isOceanLoading, isEuroeLoading, isTransactionSuccess])

  return (
    <Button
      style="text"
      disabled={!autoWallet?.wallet || !autoWallet?.address || isLoading}
      onClick={(e) => {
        e.preventDefault()
        setIsWithdrawing(true)
        sendBalance()
        revokeApprovals()
      }}
      className={className}
    >
      {isLoading && <Loader message="Awaiting transactions" />}
      Withdraw all tokens
    </Button>
  )
}
