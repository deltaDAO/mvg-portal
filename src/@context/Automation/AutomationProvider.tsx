import { LoggerInstance } from '@oceanprotocol/lib'
import { Wallet, ethers } from 'ethers'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount, useChainId, useProvider, useSignMessage } from 'wagmi'
import { getOceanConfig } from '../../@utils/ocean'
import { tokenAddressesEUROe } from '../../@utils/subgraph'
import { accountTruncate, getTokenAllowance } from '../../@utils/wallet'
import { useUserPreferences } from '../UserPreferences'
import { toast } from 'react-toastify'

export type AutomationMessage = { address: string; message: string }

export type AutomationWallet = {
  /**
   * The wallet used for automations
   */
  wallet: Wallet
  /**
   * The address that the automation wallet is used for (user address)
   * For address of the automation wallet see: wallet.address
   */
  address: string
}

export interface AutomationBalance {
  eth: string
}

export interface AutomationAllowance extends UserBalance {
  ocean: string
  euroe: string
}

export interface AutomationProviderValue {
  autoWallet: AutomationWallet
  isAutomationEnabled: boolean
  balance: AutomationBalance
  allowance: AutomationAllowance
  isLoading: boolean
  hasRetrievableBalance: () => Promise<boolean>
  hasAnyAllowance: () => boolean
  updateBalance: () => Promise<void>
  setIsAutomationEnabled: (isEnabled: boolean) => void
  exportAutomationWallet: (password: string) => void
  deleteCurrentAutomationWallet: () => void
}

// Refresh interval for balance retrieve - 20 sec
const refreshInterval = 20000

// Context
const AutomationContext = createContext({} as AutomationProviderValue)

// Provider
function AutomationProvider({ children }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { automationMessages, addAutomationMessage, removeAutomationMessage } =
    useUserPreferences()

  const [autoWallet, setAutoWallet] = useState<AutomationWallet>()
  const [isAutomationEnabled, setIsAutomationEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { signMessageAsync } = useSignMessage()

  const [balance, setBalance] = useState<AutomationBalance>({
    eth: '0'
  })
  const [allowance, setAllowance] = useState<AutomationAllowance>({
    ocean: '0',
    euroe: '0'
  })

  const wagmiProvider = useProvider()

  const getAutomationMessage = useCallback(
    (address: string) => {
      return automationMessages.find((message) => message.address === address)
    },
    [automationMessages]
  )

  const createAutomationMessage = useCallback(() => {
    console.log(`[AutomationProvider] creating automation message`)

    const messageExists = getAutomationMessage(address)
    if (messageExists) {
      console.log(`[AutomationProvider] found existing message`, {
        messageExists
      })
      return messageExists
    }

    const message = JSON.stringify(
      {
        domain: window.location.host,
        address,
        statement: 'Sign to create a new automation wallet',
        uri: window.location.origin,
        version: '1',
        timestamp: Date.now(),
        nonce: ethers.BigNumber.from(ethers.utils.randomBytes(16))._hex
      },
      null,
      2
    )
    const newMessage = { address, message }

    addAutomationMessage(newMessage)

    return newMessage
  }, [address, addAutomationMessage, getAutomationMessage])

  const createWalletFromMessage = useCallback(
    async (message: string) => {
      try {
        const signedMessage = await signMessageAsync({ message })
        const hash = ethers.utils.id(signedMessage)

        if (!hash) {
          throw new Error('Failed to create hash for key seed.')
        }

        const newWallet = new Wallet(hash, wagmiProvider)

        return newWallet
      } catch (error: any) {
        console.log('Failed to create automation key: ', error)
      }
    },
    [signMessageAsync, wagmiProvider]
  )

  useEffect(() => {
    if (!isAutomationEnabled) {
      toast.info(`Automation disabled`)
      return
    }

    if (autoWallet?.wallet?.address)
      toast.success(
        `Successfully enabled automation wallet with address ${accountTruncate(
          autoWallet?.wallet?.address
        )}`
      )
  }, [isAutomationEnabled, autoWallet?.wallet?.address])

  useEffect(() => {
    const setAutomationWallet = async () => {
      if (!address || !isAutomationEnabled || isLoading) return

      // if we already have an associated autoWallet, we don't need to setup a new one
      if (address === autoWallet?.address) return

      setIsLoading(true)
      // first cleanup potential previous initialized autoWallet
      setAutoWallet(undefined)

      const automationMessage = createAutomationMessage()

      const newWallet = await createWalletFromMessage(automationMessage.message)

      if (!newWallet) {
        toast.error('Could not create an automation wallet. Please try again.')
        setIsAutomationEnabled(false)
        return
      }

      setAutoWallet({ wallet: newWallet, address })
      setIsLoading(false)
    }

    setAutomationWallet()
  }, [
    address,
    autoWallet,
    isAutomationEnabled,
    isLoading,
    createWalletFromMessage,
    createAutomationMessage
  ])

  const exportAutomationWallet = useCallback(
    async (password: string) => {
      const message = getAutomationMessage(address)
      if (!message) {
        console.error(
          `Could not export key, no message for address ${address} in storage.`
        )
        return
      }

      const wallet = await createWalletFromMessage(message.message)

      const encrypted = await wallet.encrypt(password)

      const element = document.createElement('a')
      const jsonFile = new Blob([encrypted], {
        type: 'application/json'
      })
      element.href = URL.createObjectURL(jsonFile)
      element.download = `account_export_${wallet.address}.json`
      document.body.appendChild(element)
      element.click()
    },
    [createWalletFromMessage, getAutomationMessage, address]
  )

  const getBalance = useCallback(async (): Promise<AutomationBalance> => {
    return {
      eth: ethers.utils.formatEther(
        await wagmiProvider.getBalance(autoWallet.wallet.address, 'latest')
      )
    }
  }, [autoWallet?.wallet, wagmiProvider])

  const getAllowance = useCallback(async (): Promise<AutomationAllowance> => {
    const oceanConfig = getOceanConfig(chainId)

    return {
      ocean: await getTokenAllowance(
        autoWallet.address,
        autoWallet.wallet.address,
        18,
        oceanConfig.oceanTokenAddress,
        wagmiProvider
      ),
      euroe: await getTokenAllowance(
        autoWallet.address,
        autoWallet.wallet.address,
        6,
        tokenAddressesEUROe[chainId],
        wagmiProvider
      )
    }
  }, [autoWallet?.wallet, autoWallet?.address, wagmiProvider, chainId])

  const updateBalance = useCallback(async () => {
    if (!autoWallet) return

    try {
      const balance = await getBalance()

      const allowance = await getAllowance()

      console.log(`[AutomationProvider] autoWallet balance:`, {
        balance,
        allowance
      })

      setBalance(balance)
      setAllowance(allowance)
    } catch (error: any) {
      LoggerInstance.error('[AutomationProvider] Error: ', error.message)
    }
  }, [autoWallet, getBalance, getAllowance])

  // periodic refresh of automation wallet balance
  useEffect(() => {
    updateBalance()

    const balanceInterval = setInterval(() => updateBalance(), refreshInterval)

    return () => {
      clearInterval(balanceInterval)
    }
  }, [updateBalance])

  const hasRetrievableBalance = useCallback(async () => {
    if (!autoWallet || !autoWallet.wallet || !autoWallet.address) return

    try {
      const ethBalance = ethers.utils.parseEther(balance.eth)

      const estimatedGas = await autoWallet.wallet.estimateGas({
        to: autoWallet.address,
        value: ethBalance
      })

      const gasPrice = await autoWallet.wallet.getGasPrice()

      return estimatedGas.mul(gasPrice).lte(ethBalance)
    } catch (e) {
      console.error(
        `[AutomationProvider] could not calculate remaining balance: ${e.message}`
      )
      return false
    }
  }, [balance, autoWallet])

  const hasAnyAllowance = useCallback(() => {
    if (!allowance) return
    return (
      Object.keys(allowance).filter((token) => Number(allowance[token]) > 0)
        .length > 0
    )
  }, [allowance])

  const deleteCurrentAutomationWallet = useCallback(async () => {
    removeAutomationMessage(address)
    setAutoWallet(undefined)
    setBalance(undefined)
    setAllowance(undefined)
  }, [address, removeAutomationMessage])

  return (
    <AutomationContext.Provider
      value={{
        autoWallet,
        balance,
        allowance,
        isAutomationEnabled,
        isLoading,
        hasRetrievableBalance,
        hasAnyAllowance,
        setIsAutomationEnabled,
        updateBalance,
        exportAutomationWallet,
        deleteCurrentAutomationWallet
      }}
    >
      {children}
    </AutomationContext.Provider>
  )
}

// Helper hook to access the provider values
const useAutomation = (): AutomationProviderValue =>
  useContext(AutomationContext)

export { AutomationContext, AutomationProvider, useAutomation }
export default AutomationProvider
