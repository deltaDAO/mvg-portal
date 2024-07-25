import axios from 'axios'
import { faucet } from '../../../app.config'

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

export async function requestTokens(
  address: string,
  signature: string
): Promise<string[]> {
  try {
    const response = await axios.post<{
      status: string
      txHashes?: string[]
      message?: string
    }>(`${faucet.baseUri}/request_tokens`, { address, signature })

    return response.data.txHashes
  } catch (error) {
    throw new Error(
      `Failed to request tokens for address ${address}: ${error.message}`
    )
  }
}
