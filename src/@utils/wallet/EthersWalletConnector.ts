import { Connector, Chain, UserRejectedRequestError } from 'wagmi'
import { ethers, Wallet } from 'ethers'
import { getOceanConfig } from '@utils/ocean'

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
  }

  /**
   * Public method to load the wallet from a private key.
   * This is called from the UI after the user imports their JSON file.
   */
  async loadWallet(privateKey: string): Promise<void> {
    if (!privateKey.startsWith('0x')) {
      privateKey = `0x${privateKey}`
    }

    // Use the first chain's RPC URL to create the provider for the wallet
    const chainId = this.chains[0].id // TODO add option to configure default chain / check for last chain connected
    const config = getOceanConfig(chainId)
    this.#provider = new ethers.providers.JsonRpcProvider(config.nodeUri)

    this.#wallet = new ethers.Wallet(privateKey, this.#provider)

    // Emit a 'change' event to notify wagmi of the new account
    this.emit('change', {
      account: await this.getAccount()
    })
  }

  async connect() {
    if (!this.#wallet) {
      throw new Error('Wallet not loaded. Call loadWallet(privateKey) first.')
    }

    const account = await this.getAccount()
    const provider = await this.getProvider()
    const chainId = await this.getChainId()

    return {
      account,
      provider,
      chain: {
        id: chainId,
        unsupported: this.isChainUnsupported(chainId)
      }
    }
  }

  async disconnect() {
    this.#wallet = undefined
    this.emit('disconnect')
  }

  /**
   * Re-creates the wallet instance with a provider for the new chain.
   */
  async switchChain(chainId: number): Promise<Chain> {
    if (!this.#wallet) {
      throw new Error('Cannot switch chain. Wallet is not loaded.')
    }

    const chain = this.chains.find((chain) => chain.id === chainId)
    if (!chain) {
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

      return chain
    } catch (error) {
      console.error('Error switching chain:', error)
      throw new UserRejectedRequestError(error)
    }
  }

  async getChainId() {
    const provider = await this.getProvider()
    const network = await provider.getNetwork()
    return Number(network.chainId)
  }

  async getAccount(): Promise<`0x${string}`> {
    if (!this.#wallet) {
      throw new Error('Wallet not loaded.')
    }
    return this.#wallet.address as `0x${string}`
  }

  getWallet(): ethers.Wallet {
    return this.#wallet
  }

  async getProvider() {
    if (!this.#wallet) {
      // Return a provider for the default chain if wallet is not yet connected
      const chainId = this.chains[0].id
      const config = getOceanConfig(chainId)
      return new ethers.providers.JsonRpcProvider(config.nodeUri)
    }
    return this.#wallet.provider
  }

  async getSigner() {
    if (!this.#wallet) {
      throw new Error('Wallet not loaded.')
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
    if (error) {
      throw new Error('Error on disconnect')
    }
    this.#wallet = undefined
    this.emit('disconnect')
  }
}
