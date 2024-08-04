import axios from 'axios'
import { faucet } from '../../../app.config'
import { ethers } from 'ethers'

async function getNonce(address: string): Promise<number> {
  try {
    const response = await axios.post<{
      status: string
      nonce?: number
      message?: string
    }>(`${faucet.baseUri}/get_nonce`, { address })

    return response.data.nonce
  } catch (error) {
    throw new Error(
      `Failed to get nonce for address ${address}: ${error.message}`
    )
  }
}

export async function getMessage(address: string): Promise<string> {
  try {
    const nonce = await getNonce(address)
    return `I am requesting tokens for ${address} with nonce: ${nonce}`
  } catch (error) {
    throw new Error(
      `Failed to create message for address ${address}: ${error.message}`
    )
  }
}

export async function getChainId(): Promise<number> {
  const network = await new ethers.providers.Web3Provider(
    window?.ethereum
  ).getNetwork()
  return network.chainId
}

export async function requestTokens(
  address: string,
  signature: string
): Promise<string[]> {
  try {
    const availableNetworks = {
      32456: 'devnet',
      32457: 'testnet'
    }
    const chainId = await getChainId()
    const network = availableNetworks[chainId]

    const response = await axios.post<{
      status: string
      txHashes?: string[]
      message?: string
    }>(`${faucet.baseUri}/request_tokens/${network}`, { address, signature })

    if (response.data.status === 'error') {
      throw response.data.message
    }

    return response.data.txHashes
  } catch (error) {
    throw new Error(`Failed to request tokens for address ${address}: ${error}`)
  }
}
