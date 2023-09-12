import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { Wallet, ethers } from 'ethers'
import { useAccount, useProvider, useSignMessage } from 'wagmi'
import { getOceanConfig } from '../../@utils/ocean'
import { tokenAddressesEUROe } from '../../@utils/subgraph'
import { getTokenAllowance } from '../../@utils/wallet'
import { useUserPreferences } from '../UserPreferences'

export type AutomationMessage = { address: string; message: string }
export type AutomationWallet = { wallet: Wallet; address: string }

export interface AutomationProviderValue {
  autoWallet: AutomationWallet
  balance: UserBalance
  allowance: UserBalance
  exportAutomationWallet: (password: string) => void
  deleteCurrentAutomationWallet: () => void
  setIsAutomationEnabled: (isEnabled: boolean) => void
}

// Refresh interval for balance retrieve - 20 sec
const refreshInterval = 20000

// Context
const AutomationContext = createContext({} as AutomationProviderValue)

// Provider
function AutomationProvider({ children }) {
  const { connector, address } = useAccount()
  const [chainId, setChainId] = useState<number>()
  const { automationMessages, addAutomationMessage, removeAutomationMessage } =
    useUserPreferences()

  const [autoWallet, setAutoWallet] = useState<AutomationWallet>()
  const [isAutomationEnabled, setIsAutomationEnabled] = useState<boolean>(false)

  const { signMessageAsync } = useSignMessage()

  const [balance, setBalance] = useState<UserBalance | undefined>({
    eth: '0'
  })
  const [allowance, setAllowance] = useState<UserBalance | undefined>({
    ocean: '0',
    euroe: '0'
  })

  const wagmiProvider = useProvider()

  useEffect(() => {
    if (!connector) return

    const setNewChainId = async () => {
      setChainId(await connector.getChainId())
    }

    setNewChainId()
  }, [connector])

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

  const deleteCurrentAutomationWallet = useCallback(() => {
    removeAutomationMessage(address)
    setAutoWallet(undefined)
    setBalance(undefined)
  }, [address, removeAutomationMessage])

  const createWalletFromMessage = useCallback(
    async (message: string) => {
      try {
        const signedMessage = await signMessageAsync({ message })
        const hash = ethers.utils.id(signedMessage)

        if (!hash) {
          throw new Error('Failed to create hash for key seed.')
        }

        console.log({ hash })

        const newWallet = new Wallet(hash)

        return newWallet
      } catch (error: any) {
        console.log('Failed to create automation key: ', error)
      }
    },
    [signMessageAsync]
  )

  useEffect(() => {
    const setAutomationWallet = async () => {
      console.log('useEffect first check')
      if (!address || !isAutomationEnabled) return

      console.log('useEffect second check')
      // if we already have an autoWallet for current account (address), skip creation
      if (address === autoWallet?.address) return

      console.log('useEffect we need creation')
      const automationMessage = createAutomationMessage()

      const newWallet = await createWalletFromMessage(automationMessage.message)

      setAutoWallet({ wallet: newWallet, address })
    }

    setAutomationWallet()
  }, [
    address,
    autoWallet?.address,
    isAutomationEnabled,
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

  const updateBalance = useCallback(async () => {
    if (!autoWallet) return

    try {
      const oceanConfig = getOceanConfig(chainId)

      const balance = {
        eth: ethers.utils.formatEther(
          await wagmiProvider.getBalance(autoWallet.address, 'latest')
        )
      }

      const allowance = {
        ocean: await getTokenAllowance(
          address,
          autoWallet.address,
          18,
          oceanConfig.oceanTokenAddress,
          wagmiProvider
        ),
        euroe: await getTokenAllowance(
          address,
          autoWallet.address,
          6,
          tokenAddressesEUROe[chainId],
          wagmiProvider
        )
      }

      console.log(`[AutomationProvider] autoWallet balance:`, {
        balance,
        allowance
      })

      setBalance(balance)
      setAllowance(allowance)
    } catch (error: any) {
      LoggerInstance.error('[AutomationProvider] Error: ', error.message)
    }
  }, [address, chainId, autoWallet, wagmiProvider])

  // periodic refresh of automation wallet balance
  useEffect(() => {
    updateBalance()

    const balanceInterval = setInterval(() => updateBalance(), refreshInterval)

    return () => {
      clearInterval(balanceInterval)
    }
  }, [updateBalance])

  return (
    <AutomationContext.Provider
      value={{
        autoWallet,
        balance,
        allowance,
        exportAutomationWallet,
        setIsAutomationEnabled,
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
