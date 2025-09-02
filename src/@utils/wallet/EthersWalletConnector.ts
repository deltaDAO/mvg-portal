import { Connector, Chain, UserRejectedRequestError } from 'wagmi'
import { ethers, Wallet } from 'ethers'
import { getOceanConfig } from '@utils/ocean'
import { LoggerInstance } from '@oceanprotocol/lib'

export const JSON_WALLET_CONNECTOR_ID = 'jsonWallet'

export class EthersWalletConnector extends Connector {
  readonly id = JSON_WALLET_CONNECTOR_ID
  readonly name = 'JSON Wallet'
  readonly ready: boolean

  #provider?: ethers.providers.JsonRpcProvider
  #wallet?: Wallet

  constructor({ chains, options }: { chains?: Chain[]; options?: unknown }) {
    super({ chains, options })
    this.ready = true
    LoggerInstance.log('[EthersWalletConnector] Connector initialized.')
  }

  /**
   * Public method to load the wallet from a private key.
   * This is called from the UI after the user imports their JSON file.
   */
  async loadWallet(privateKey: string): Promise<void> {
    const context = '[EthersWalletConnector:loadWallet]'
    LoggerInstance.log(`${context} Attempting to load wallet.`)

    try {
      if (!privateKey.startsWith('0x')) {
        privateKey = `0x${privateKey}`
      }

      // Use the first chain's RPC URL to create the provider for the wallet
      const chainId = this.chains[0].id // TODO add option to configure default chain / check for last chain connected
      const config = getOceanConfig(chainId)
      this.#provider = new ethers.providers.JsonRpcProvider(config.nodeUri)

      this.#wallet = new ethers.Wallet(privateKey, this.#provider)
      const address = await this.#wallet.getAddress()

      LoggerInstance.log(
        `${context} Wallet loaded successfully for address: ${address}`
      )

      // Emit a 'change' event to notify wagmi of the new account
      this.emit('change', {
        account: await this.getAccount()
      })
    } catch (error) {
      LoggerInstance.error(`${context} Failed to load wallet.`, error)
      throw new Error('Failed to parse private key or initialize wallet.')
    }
  }

  async connect() {
    const context = '[EthersWalletConnector:connect]'
    LoggerInstance.log(`${context} Attempting to connect.`)

    if (!this.#wallet) {
      LoggerInstance.warn(
        `${context} Wallet not loaded. 'loadWallet' must be called first.`
      )
      throw new Error('Wallet not loaded. Call loadWallet(privateKey) first.')
    }

    try {
      const account = await this.getAccount()
      const provider = await this.getProvider()
      const chainId = await this.getChainId()

      LoggerInstance.log(
        `${context} Connection successful for account: ${account}`
      )

      return {
        account,
        provider,
        chain: {
          id: chainId,
          unsupported: this.isChainUnsupported(chainId)
        }
      }
    } catch (error) {
      LoggerInstance.error(`${context} Connection failed.`, error)
      throw new Error('Could not establish connection.')
    }
  }

  async disconnect() {
    LoggerInstance.log(
      '[EthersWalletConnector:disconnect] Disconnecting wallet.'
    )
    this.#wallet = undefined
    this.emit('disconnect')
  }

  /**
   * Re-creates the wallet instance with a provider for the new chain.
   */
  async switchChain(chainId: number): Promise<Chain> {
    const context = '[EthersWalletConnector:switchChain]'
    LoggerInstance.log(`${context} Attempting to switch to chainId: ${chainId}`)

    if (!this.#wallet) {
      throw new Error('Cannot switch chain. Wallet is not loaded.')
    }

    const chain = this.chains.find((chain) => chain.id === chainId)
    if (!chain) {
      LoggerInstance.warn(`${context} Unsupported chainId: ${chainId}`)
      throw new Error(`Chain with id ${chainId} not supported.`)
    }

    try {
      // 1. Get the private key from the existing wallet instance.
      const { privateKey } = this.#wallet

      // 2. Get the new chain's RPC configuration.
      const config = getOceanConfig(chainId)
      this.#provider = new ethers.providers.JsonRpcProvider(config.nodeUri)

      // 3. Create a new wallet instance with the same key on the new provider.
      this.#wallet = new ethers.Wallet(privateKey, this.#provider)

      // 4. Notify wagmi that the chain has changed.
      this.emit('change', { chain: { id: chainId, unsupported: false } })
      LoggerInstance.log(
        `${context} Successfully switched to chainId: ${chainId}`
      )
      return chain
    } catch (error) {
      LoggerInstance.error(`${context} Failed to switch chain.`, error)
      throw new UserRejectedRequestError(error as Error)
    }
  }

  async getChainId() {
    const context = '[EthersWalletConnector:getChainId]'
    try {
      const provider = await this.getProvider()
      const network = await provider.getNetwork()
      return Number(network.chainId)
    } catch (error) {
      LoggerInstance.error(`${context} Failed to get chainId.`, error)
      throw error
    }
  }

  async getAccount(): Promise<`0x${string}`> {
    const context = '[EthersWalletConnector:getAccount]'
    if (!this.#wallet) {
      throw new Error(`${context} Wallet not loaded.`)
    }
    return this.#wallet.address as `0x${string}`
  }

  getWallet(): ethers.Wallet {
    const context = '[EthersWalletConnector:getWallet]'
    if (!this.#wallet) {
      LoggerInstance.warn(
        `${context} Wallet is not loaded, returning undefined.`
      )
    }
    return this.#wallet
  }

  async getProvider() {
    const context = '[EthersWalletConnector:getProvider]'
    try {
      if (this.#wallet?.provider) {
        return this.#wallet.provider
      }
      // Return a provider for the default chain if wallet is not yet connected
      LoggerInstance.log(
        `${context} Wallet not loaded, creating default provider.`
      )
      const chainId = this.chains[0].id
      const config = getOceanConfig(chainId)
      return new ethers.providers.JsonRpcProvider(config.nodeUri)
    } catch (error) {
      LoggerInstance.error(`${context} Failed to get provider.`, error)
      throw error
    }
  }

  async getSigner() {
    const context = '[EthersWalletConnector:getSigner]'
    if (!this.#wallet) {
      throw new Error(`${context} Wallet not loaded.`)
    }
    return this.#wallet
  }

  async isAuthorized(): Promise<boolean> {
    // A wallet is "authorized" if the instance exists.
    return !!this.#wallet
  }

  // --- Event handlers ---

  protected onAccountsChanged = (accounts: string[]) => {
    // This wallet has a fixed account, so we can ignore this.
  }

  protected onChainChanged = (chainId: string | number) => {
    // Do nothing
  }

  protected onDisconnect = (error: Error) => {
    const context = '[EthersWalletConnector:onDisconnect]'
    LoggerInstance.log(`${context} Disconnect event received.`)
    if (error) {
      LoggerInstance.error(`${context} Error on disconnect.`, error)
    }
    this.#wallet = undefined
    this.emit('disconnect')
  }
}
