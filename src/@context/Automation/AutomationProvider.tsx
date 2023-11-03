import { LoggerInstance } from '@oceanprotocol/lib'
import { Wallet, ethers } from 'ethers'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useProvider, useBalance as useWagmiBalance } from 'wagmi'
import { accountTruncate } from '../../@utils/wallet'
import { useUserPreferences } from '../UserPreferences'
import { toast } from 'react-toastify'

import { useMarketMetadata } from '../MarketMetadata'
import DeleteAutomationModal from './DeleteAutomationModal'
import useBalance from '../../@hooks/useBalance'

export enum AUTOMATION_MODES {
  SIMPLE = 'simple',
  ADVANCED = 'advanced'
}

export interface NativeTokenBalance {
  symbol: string
  balance: string
}
export interface AutomationProviderValue {
  autoWallet: Wallet
  autoWalletAddress: string
  isAutomationEnabled: boolean
  balance: UserBalance
  nativeBalance: NativeTokenBalance
  isLoading: boolean
  decryptPercentage: number
  hasValidEncryptedWallet: boolean
  updateBalance: () => Promise<void>
  setIsAutomationEnabled: (isEnabled: boolean) => void
  deleteCurrentAutomationWallet: () => void
  importAutomationWallet: (encryptedJson: string) => Promise<boolean>
  decryptAutomationWallet: (password: string) => Promise<boolean>
}

// Refresh interval for balance retrieve - 20 sec
const refreshInterval = 20000

// Context
const AutomationContext = createContext({} as AutomationProviderValue)

// Provider
function AutomationProvider({ children }) {
  const { getApprovedTokenBalances } = useBalance()
  const { approvedBaseTokens } = useMarketMetadata()
  const { automationWalletJSON, setAutomationWalletJSON } = useUserPreferences()

  const [autoWallet, setAutoWallet] = useState<Wallet>()
  const [isAutomationEnabled, setIsAutomationEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [autoWalletAddress, setAutoWalletAddress] = useState<string>()
  const [decryptPercentage, setDecryptPercentage] = useState<number>()
  const [hasValidEncryptedWallet, setHasValidEncryptedWallet] =
    useState<boolean>()

  const { data: balanceNativeToken } = useWagmiBalance({
    address: autoWallet?.address as `0x${string}`
  })

  const [nativeBalance, setNativeBalance] = useState<NativeTokenBalance>()
  const [balance, setBalance] = useState<UserBalance>({})

  const [hasDeleteRequest, setHasDeleteRequest] = useState(false)

  const wagmiProvider = useProvider()

  useEffect(() => {
    if (!automationWalletJSON) setAutoWalletAddress(undefined)
    else
      setAutoWalletAddress(
        ethers.utils.getJsonWalletAddress(automationWalletJSON)
      )
  }, [automationWalletJSON])

  useEffect(() => {
    if (autoWallet && !isAutomationEnabled) {
      toast.info(`Automation disabled`)
      return
    }

    if (autoWallet?.address)
      toast.success(
        `Successfully enabled automation wallet with address ${accountTruncate(
          autoWallet?.address
        )}`
      )
  }, [isAutomationEnabled, autoWallet])

  const updateBalance = useCallback(async () => {
    if (!autoWallet) return

    try {
      if (balanceNativeToken)
        setNativeBalance({
          symbol: balanceNativeToken?.symbol.toLowerCase() || 'ETH',
          balance: balanceNativeToken?.formatted
        })

      if (approvedBaseTokens?.length > 0) {
        const newBalance = await getApprovedTokenBalances(autoWallet?.address)
        setBalance(newBalance)
      } else setBalance(undefined)
    } catch (error) {
      LoggerInstance.error('[AutomationProvider] Error: ', error.message)
    }
  }, [
    autoWallet,
    balanceNativeToken,
    approvedBaseTokens,
    getApprovedTokenBalances
  ])

  // periodic refresh of automation wallet balance
  useEffect(() => {
    updateBalance()

    const balanceInterval = setInterval(() => updateBalance(), refreshInterval)

    return () => {
      clearInterval(balanceInterval)
    }
  }, [updateBalance])

  const deleteCurrentAutomationWallet = () => {
    setHasDeleteRequest(true)
  }

  const removeAutomationWalletAndCleanup = () => {
    setIsLoading(true)
    setIsAutomationEnabled(false)
    setAutoWallet(undefined)
    setAutoWalletAddress(undefined)
    setAutomationWalletJSON(undefined)
    setBalance(undefined)
    toast.info('The automation wallet was removed from your machine.')
    setHasDeleteRequest(false)
    setIsLoading(false)
  }

  useEffect(() => {
    setHasValidEncryptedWallet(ethers.utils.isAddress(autoWalletAddress))
  }, [autoWalletAddress])

  const importAutomationWallet = async (encryptedJson: string) => {
    if (
      ethers.utils.isAddress(ethers.utils.getJsonWalletAddress(encryptedJson))
    ) {
      setAutomationWalletJSON(encryptedJson)
      return true
    } else {
      toast.error('Could not import Wallet. Invalid address.')
      LoggerInstance.error(
        '[AutomationProvider] Could not import Wallet. Invalid address.'
      )
      return false
    }
  }

  const decryptAutomationWallet = useCallback(
    async (password: string) => {
      try {
        setIsLoading(true)
        if (!automationWalletJSON)
          throw new Error('No JSON to decrypt in local storage.')

        LoggerInstance.log(
          '[AutomationProvider] Start decrypting wallet from local storage'
        )
        const wallet = await ethers.Wallet.fromEncryptedJson(
          automationWalletJSON,
          password,
          (percent) => setDecryptPercentage(percent)
        )
        const connectedWallet = wallet.connect(wagmiProvider)
        LoggerInstance.log('[AutomationProvider] Finished decrypting:', {
          connectedWallet
        })
        setAutoWallet(connectedWallet)
        toast.success(
          `Successfully imported wallet ${connectedWallet.address} for automation.`
        )
        return true
      } catch (e) {
        toast.error(
          `Could not decrypt the automation wallet. See console for more information.`
        )
        LoggerInstance.error(e)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [wagmiProvider, automationWalletJSON]
  )

  return (
    <AutomationContext.Provider
      value={{
        autoWallet,
        autoWalletAddress,
        balance,
        nativeBalance,
        isAutomationEnabled,
        isLoading,
        decryptPercentage,
        hasValidEncryptedWallet,
        setIsAutomationEnabled,
        updateBalance,
        deleteCurrentAutomationWallet,
        importAutomationWallet,
        decryptAutomationWallet
      }}
    >
      {children}
      <DeleteAutomationModal
        hasDeleteRequest={hasDeleteRequest}
        setHasDeleteRequest={setHasDeleteRequest}
        disabled={isLoading}
        onDeleteConfirm={() => removeAutomationWalletAndCleanup()}
      />
    </AutomationContext.Provider>
  )
}

// Helper hook to access the provider values
const useAutomation = (): AutomationProviderValue =>
  useContext(AutomationContext)

export { AutomationContext, AutomationProvider, useAutomation }
export default AutomationProvider
