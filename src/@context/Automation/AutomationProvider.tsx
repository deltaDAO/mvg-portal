import { LoggerInstance } from '@oceanprotocol/lib'
import { Wallet, ethers } from 'ethers'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAccount, useChainId, useProvider } from 'wagmi'
import { getOceanConfig } from '../../@utils/ocean'
import { tokenAddressesEUROe } from '../../@utils/subgraph'
import { accountTruncate, getTokenAllowance } from '../../@utils/wallet'
import { useUserPreferences } from '../UserPreferences'
import { toast } from 'react-toastify'
import Modal from '../../components/@shared/atoms/Modal'
import Button from '../../components/@shared/atoms/Button'
import styles from './AutomationProvider.module.css'
import Loader from '../../components/@shared/atoms/Loader'

export interface AutomationBalance {
  eth: string
}

export interface AutomationAllowance extends UserBalance {
  ocean: string
  euroe: string
}

export interface AutomationProviderValue {
  autoWallet: Wallet
  autoWalletAddress: string
  isAutomationEnabled: boolean
  balance: AutomationBalance
  allowance: AutomationAllowance
  isLoading: boolean
  decryptPercentage: number
  hasRetrievableBalance: () => Promise<boolean>
  hasAnyAllowance: () => boolean
  updateBalance: () => Promise<void>
  setIsAutomationEnabled: (isEnabled: boolean) => void
  exportAutomationWallet: (password: string) => Promise<void>
  deleteCurrentAutomationWallet: () => void
  importAutomationWallet: (encryptedJson: string) => Promise<boolean>
  hasValidEncryptedWallet: () => boolean
  decryptAutomationWallet: (password: string) => Promise<boolean>
}

// Refresh interval for balance retrieve - 20 sec
const refreshInterval = 20000

// Context
const AutomationContext = createContext({} as AutomationProviderValue)

// Provider
function AutomationProvider({ children }) {
  const { address } = useAccount()
  const chainId = useChainId()
  const { automationWalletJSON, setAutomationWalletJSON } = useUserPreferences()

  const [autoWallet, setAutoWallet] = useState<Wallet>()
  const [isAutomationEnabled, setIsAutomationEnabled] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [autoWalletAddress, setAutoWalletAddress] = useState<string>()
  const [decryptPercentage, setDecryptPercentage] = useState<number>()

  const [balance, setBalance] = useState<AutomationBalance>({
    eth: '0'
  })
  const [allowance, setAllowance] = useState<AutomationAllowance>({
    ocean: '0',
    euroe: '0'
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmedDeletion, setConfirmedDeletion] = useState(false)

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

  const exportAutomationWallet = useCallback(
    async (password: string) => {
      if (!autoWallet || !autoWallet) {
        toast.error(`Automation wallet does not exist.`)
        return
      }
      setIsLoading(true)

      const encrypted = await autoWallet.encrypt(password)

      const element = document.createElement('a')
      const jsonFile = new Blob([encrypted], {
        type: 'application/json'
      })
      element.href = URL.createObjectURL(jsonFile)
      element.download = `account_export_${autoWallet.address}.json`
      document.body.appendChild(element)
      element.click()
      setIsLoading(false)
    },
    [autoWallet]
  )

  const getBalance = useCallback(async (): Promise<AutomationBalance> => {
    return {
      eth: ethers.utils.formatEther(
        await wagmiProvider.getBalance(autoWallet.address, 'latest')
      )
    }
  }, [autoWallet, wagmiProvider])

  const getAllowance = useCallback(async (): Promise<AutomationAllowance> => {
    const oceanConfig = getOceanConfig(chainId)

    return {
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
  }, [address, autoWallet?.address, wagmiProvider, chainId])

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
    } catch (error) {
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
    if (!autoWallet || !address) return

    try {
      const ethBalance = ethers.utils.parseEther(balance.eth)

      const estimatedGas = await autoWallet.estimateGas({
        to: autoWallet.address,
        value: ethBalance
      })

      const gasPrice = await autoWallet.getGasPrice()

      return estimatedGas.mul(gasPrice).lte(ethBalance)
    } catch (e) {
      console.error(
        `[AutomationProvider] could not calculate remaining balance: ${e.message}`
      )
      return false
    }
  }, [address, balance, autoWallet])

  const hasAnyAllowance = useCallback(() => {
    if (!allowance) return
    return (
      Object.keys(allowance).filter((token) => Number(allowance[token]) > 0)
        .length > 0
    )
  }, [allowance])

  const deleteCurrentAutomationWallet = () => {
    setIsModalOpen(true)
  }

  useEffect(() => {
    const manageDeletion = async () => {
      if (isModalOpen && !confirmedDeletion) return

      if (confirmedDeletion) {
        setIsLoading(true)
        setIsAutomationEnabled(false)
        setAutoWallet(undefined)
        setAutomationWalletJSON(undefined)
        setBalance(undefined)
        setAllowance(undefined)
        setConfirmedDeletion(false)
        toast.info('The automation wallet was removed from your machine.')
        setIsModalOpen(false)
        setIsLoading(false)
      }
    }

    manageDeletion()
  }, [
    address,
    isModalOpen,
    confirmedDeletion,
    hasAnyAllowance,
    hasRetrievableBalance,
    setAutomationWalletJSON
  ])

  const hasValidEncryptedWallet = useCallback(() => {
    return ethers.utils.isAddress(autoWalletAddress)
  }, [autoWalletAddress])

  const importAutomationWallet = async (encryptedJson: string) => {
    if (
      ethers.utils.isAddress(ethers.utils.getJsonWalletAddress(encryptedJson))
    ) {
      setAutomationWalletJSON(encryptedJson)
      return true
    } else {
      toast.error('Could not import Wallet. JSON format invalid.')
      LoggerInstance.error('Could not import Wallet. JSON format invalid.')
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
          `Succesfully imported wallet ${connectedWallet.address} for automation.`
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
        allowance,
        isAutomationEnabled,
        isLoading,
        decryptPercentage,
        hasRetrievableBalance,
        hasAnyAllowance,
        setIsAutomationEnabled,
        updateBalance,
        exportAutomationWallet,
        deleteCurrentAutomationWallet,
        importAutomationWallet,
        hasValidEncryptedWallet,
        decryptAutomationWallet
      }}
    >
      {children}
      <Modal
        title="Automation Wallet"
        onToggleModal={() => setIsModalOpen(!isModalOpen)}
        isOpen={isModalOpen}
        className={styles.modal}
      >
        {autoWallet?.address && Number(balance?.eth) > 0 ? (
          <>
            <strong>
              {' '}
              The automation wallet {accountTruncate(autoWallet?.address)} still
              contains {balance?.eth} network tokens.
            </strong>
            <br />
            If you delete the wallet you will not be able to access related
            funds from the portal without reimporting. Do you want to continue?
          </>
        ) : (
          <>
            <strong>
              {' '}
              The automation wallet {accountTruncate(autoWallet?.address)} does
              not contain any funds.
            </strong>
            <br />
            If you delete the wallet you will not be able to access it from the
            portal without reimporting. Do you want to continue?
          </>
        )}
        <br />
        <div className={styles.modalActions}>
          <Button
            size="small"
            className={styles.modalCancelBtn}
            onClick={() => setIsModalOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="small"
            className={styles.modalConfirmBtn}
            onClick={() => {
              setConfirmedDeletion(true)
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader message={`Loading...`} /> : `Confirm`}
          </Button>
        </div>
      </Modal>
    </AutomationContext.Provider>
  )
}

// Helper hook to access the provider values
const useAutomation = (): AutomationProviderValue =>
  useContext(AutomationContext)

export { AutomationContext, AutomationProvider, useAutomation }
export default AutomationProvider
