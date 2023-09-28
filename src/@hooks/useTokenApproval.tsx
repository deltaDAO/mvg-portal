import {
  erc20ABI,
  useChainId,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi'
import { useAutomation } from '../@context/Automation/AutomationProvider'
import { useCallback, useEffect, useState } from 'react'
import { getOceanConfig } from '../@utils/ocean'
import { tokenAddressesEUROe } from '../@utils/subgraph'
import { ethers } from 'ethers'
import { toast } from 'react-toastify'

export type TokenApprovalProviderValue = {
  isLoading: boolean
  setValue: (value: string) => void
  approve: () => void
}

export default function useTokenApproval(): TokenApprovalProviderValue {
  const { autoWallet, allowance, updateBalance } = useAutomation()

  const chainId = useChainId()

  const [oceanTokenAddress, setOceanTokenAddress] = useState<`0x${string}`>()
  const [euroeTokenAddress, setEuroeTokenAddress] = useState<`0x${string}`>()

  const [value, setValue] = useState<string>('0')

  const [euroeApprovalError, setEuroeApprovalError] = useState<boolean>()
  const [oceanApprovalError, setOceanApprovalError] = useState<boolean>()
  const [euroeApprovalSuccess, setEuroeApprovalSuccess] = useState<boolean>()
  const [oceanApprovalSuccess, setOceanApprovalSuccess] = useState<boolean>()
  const [isLoading, setIsLoading] = useState<boolean>()

  /**
   * OCEAN
   */
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
      autoWallet?.address as `0x${string}`,
      ethers.utils.parseUnits(value, 18)
    ]
  })
  const {
    data: oceanData,
    write: oceanWrite,
    isLoading: isOceanLoading,
    isError: isOceanError,
    isSuccess: isOceanSuccess
  } = useContractWrite(oceanConfig)

  const {
    isLoading: isOceanTransactionLoading,
    isSuccess: isOceanTransactionSuccess,
    isError: isOceanTransactionError
  } = useWaitForTransaction({
    hash: oceanData?.hash
  })

  /**
   * EUROe
   */
  const { config: euroeConfig } = usePrepareContractWrite({
    address: euroeTokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      autoWallet?.address as `0x${string}`,
      ethers.utils.parseUnits(value, 6)
    ]
  })
  const {
    data: euroeData,
    write: euroeWrite,
    isLoading: isEuroeLoading,
    isError: isEuroeError,
    isSuccess: isEuroeSuccess
  } = useContractWrite(euroeConfig)

  const {
    isLoading: isEuroeTransactionLoading,
    isSuccess: isEuroeTransactionSuccess,
    isError: isEuroeTransactionError
  } = useWaitForTransaction({
    hash: euroeData?.hash
  })

  /**
   * State Management
   */
  useEffect(() => {
    setOceanApprovalError(isOceanError || isOceanTransactionError)
  }, [isOceanError, isOceanTransactionError])

  useEffect(() => {
    setEuroeApprovalError(isEuroeError || isEuroeTransactionError)
  }, [isEuroeError, isEuroeTransactionError])

  useEffect(() => {
    setOceanApprovalSuccess(isOceanSuccess && isOceanTransactionSuccess)
  }, [isOceanSuccess, isOceanTransactionSuccess])

  useEffect(() => {
    setEuroeApprovalSuccess(isEuroeSuccess && isEuroeTransactionSuccess)
  }, [isEuroeSuccess, isEuroeTransactionSuccess])

  useEffect(() => {
    setIsLoading(
      isEuroeLoading ||
        isOceanLoading ||
        isEuroeTransactionLoading ||
        isOceanTransactionLoading
    )
  }, [
    isEuroeLoading,
    isOceanLoading,
    isEuroeTransactionLoading,
    isOceanTransactionLoading
  ])

  /**
   * User Notifications
   */
  useEffect(() => {
    const success = async () => {
      if (euroeApprovalSuccess) {
        await updateBalance()
        toast.success('Successfully updated allowance of EUROe.')
      }
    }
    success()
  }, [euroeApprovalSuccess, updateBalance])
  useEffect(() => {
    const success = async () => {
      if (oceanApprovalSuccess) {
        await updateBalance()
        toast.success('Successfully updated allowance of OCEAN.')
      }
    }
    success()
  }, [oceanApprovalSuccess, updateBalance])
  useEffect(() => {
    if (euroeApprovalError)
      toast.error('Could not update allowance for EUROe. Please try again.')
  }, [euroeApprovalError])
  useEffect(() => {
    if (oceanApprovalError)
      toast.error('Could not update allowance for OCEAN. Please try again.')
  }, [oceanApprovalError])

  /**
   * APPROVAL
   */
  const approve = useCallback(() => {
    console.log(`[TokenApproval] Approval Request`, { allowance, value })
    if (Number(allowance.ocean) !== Number(value)) oceanWrite?.()
    if (Number(allowance.euroe) !== Number(value)) euroeWrite?.()
  }, [allowance, value, euroeWrite, oceanWrite])

  return {
    isLoading,
    setValue,
    approve
  }
}
