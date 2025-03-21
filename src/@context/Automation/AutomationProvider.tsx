import { LoggerInstance } from '@oceanprotocol/lib'
import { Wallet, ethers } from 'ethers'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import {
  usePublicClient,
  useBalance as useWagmiBalance,
  useAccount
} from 'wagmi'
import { accountTruncate } from '../../@utils/wallet'
import { useUserPreferences } from '../UserPreferences'
import { toast } from 'react-toastify'

import { useMarketMetadata } from '../MarketMetadata'
import DeleteAutomationModal from './DeleteAutomationModal'
import useBalance from '../../@hooks/useBalance'
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export enum AUTOMATION_MODES {
  SIMPLE = 'simple',
  ADVANCED = 'advanced'
}

export interface AutomationProviderValue {
  autoWallet: Wallet
  autoWalletAddress: string
  isAutomationEnabled: boolean
  balance: UserBalance
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
  const { approvedBaseTokens, appConfig } = useMarketMetadata()
  const { automationWalletJSON, setAutomationWalletJSON } = useUserPreferences()
  const { chain } = useAccount()

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

  const [balance, setBalance] = useState<UserBalance>({
    native: {
      symbol: 'eth',
      balance: '0'
    }
  })

  const [hasDeleteRequest, setHasDeleteRequest] = useState(false)

  const wagmiProvider = usePublicClient()

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
      const newBalance: UserBalance = {
        native: {
          symbol: 'eth',
          balance: '0'
        }
      }
      if (balanceNativeToken)
        newBalance.native.symbol =
          balanceNativeToken?.symbol.toLowerCase() || 'eth'
      newBalance.native.balance = balanceNativeToken?.formatted

      if (approvedBaseTokens?.length > 0) {
        const approved = await getApprovedTokenBalances(autoWallet?.address)
        newBalance.approved = approved
      }
      setBalance(newBalance)
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

        // Decrypt JSON wallet with ethers (keep this part)
        const ethersWallet = await ethers.Wallet.fromEncryptedJson(
          automationWalletJSON,
          password,
          (percent) => setDecryptPercentage(percent)
        )

        // Instead of connecting to provider, create a viem account from private key
        const privateKey = ethersWallet.privateKey as `0x${string}`
        const viemAccount = privateKeyToAccount(privateKey)

        // Create a wallet client with the account
        const viemWalletClient = createWalletClient({
          account: viemAccount,
          chain,
          transport: http()
        })

        // Store the wallet for later use
        setAutoWallet(ethersWallet)

        LoggerInstance.log('[AutomationProvider] Finished decrypting:', {
          address: viemAccount.address
        })

        toast.success(
          `Successfully imported wallet ${viemAccount.address} for automation.`
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
    <>
      {appConfig.automationConfig.enableAutomation === 'true' ? (
        <AutomationContext.Provider
          value={{
            autoWallet,
            autoWalletAddress,
            balance,
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
      ) : (
        <>{children}</>
      )}
    </>
  )
}

// Helper hook to access the provider values
const useAutomation = (): AutomationProviderValue =>
  useContext(AutomationContext)

export { AutomationContext, AutomationProvider, useAutomation }
export default AutomationProvider
