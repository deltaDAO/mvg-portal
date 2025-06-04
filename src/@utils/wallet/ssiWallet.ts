import axios from 'axios'
import {
  SsiKeyDesc,
  SsiWalletIssuer,
  SsiVerifiableCredential,
  SsiWalletDesc,
  SsiWalletSession,
  SsiWalletDid
} from 'src/@types/SsiWallet'
import { Signer } from 'ethers'
import { ssiWalletApi } from 'app.config.cjs'

export const STORAGE_KEY = 'ssiWalletApiOverride'

export function setSsiWalletApiOverride(url: string) {
  sessionStorage.setItem(STORAGE_KEY, url)
}

export function getSsiWalletApi(): string {
  const override = sessionStorage.getItem(STORAGE_KEY)
  return override || ssiWalletApi
}

export async function connectToWallet(
  owner: Signer
): Promise<SsiWalletSession> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }

  try {
    let response = await axios.get(`${api}/wallet-api/auth/account/web3/nonce`)

    const nonce = response.data
    const payload = {
      challenge: nonce,
      signed: await owner.signMessage(nonce),
      publicKey: await owner.getAddress()
    }

    response = await axios.post(
      `${api}/wallet-api/auth/account/web3/signed`,
      payload
    )
    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function disconnectFromWallet() {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    await axios.post(`${api}/wallet-api/auth/logout`)
  } catch (error) {
    throw error.response
  }
}

export async function isSessionValid(token: string): Promise<boolean> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    await axios.get(`${api}/wallet-api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    })

    return true
  } catch (error) {
    return false
  }
}

export async function getWallets(token: string): Promise<SsiWalletDesc[]> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.get(
      `${api}/wallet-api/wallet/accounts/wallets`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    const result: { wallets: SsiWalletDesc[] } = response.data
    return result.wallets
  } catch (error) {
    throw error.response
  }
}

export async function getWalletKeys(
  wallet: SsiWalletDesc,
  token: string
): Promise<SsiKeyDesc[]> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.get(
      `${api}/wallet-api/wallet/${wallet?.id}/keys`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletKey(
  walletId: string,
  keyId: string,
  token: string
) {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.get(
      `${api}/wallet-api/wallet/${walletId}/keys/${keyId}/load`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function signMessage(
  walletId: string,
  keyId: string,
  message: any,
  token: string
): Promise<string> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.post(
      `${api}/wallet-api/wallet/${walletId}/keys/${keyId}/sign`,
      message,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletIssuers(
  walletId: string,
  token: string
): Promise<SsiWalletIssuer[]> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.get(
      `${api}/wallet-api/wallet/${walletId}/issuers`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletDids(
  walletId: string,
  token: string
): Promise<SsiWalletDid[]> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.get(
      `${api}/wallet-api/wallet/${walletId}/dids`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export function extractURLSearchParams(
  urlString: string
): Record<string, string> {
  const url = new URL(urlString)
  const { searchParams } = url
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => (params[key] = value))
  return params
}

export async function matchCredentialForPresentationDefinition(
  walletId: string,
  presentationDefinition: any,
  token: string
): Promise<SsiVerifiableCredential[]> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.post(
      `${api}/wallet-api/wallet/${walletId}/exchange/matchCredentialsForPresentationDefinition`,
      presentationDefinition,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function resolvePresentationRequest(
  walletId: string,
  presentationRequest: string,
  token: string
): Promise<string> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.post(
      `${api}/wallet-api/wallet/${walletId}/exchange/resolvePresentationRequest`,
      presentationRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function usePresentationRequest(
  walletId: string,
  did: string,
  presentationRequest: string,
  selectedCredentials: string[],
  token: string
): Promise<{ redirectUri: string }> {
  const api = getSsiWalletApi()
  if (!api) {
    throw new Error('No SSI Wallet API configured')
  }
  try {
    const response = await axios.post(
      `${api}/wallet-api/wallet/${walletId}/exchange/usePresentationRequest`,
      {
        did,
        presentationRequest,
        selectedCredentials
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export function getSsiVerifiableCredentialType(
  credential: SsiVerifiableCredential
): string {
  let result = 'Unknown'
  const list = credential?.parsedDocument?.type?.filter(
    (value) =>
      value !== 'VerifiableCredential' && value !== 'VerifiableAttestation'
  )
  if (list?.length > 0) {
    result = list[0]
  }
  return result
}
