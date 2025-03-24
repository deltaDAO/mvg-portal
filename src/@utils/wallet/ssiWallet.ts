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

export async function connectToWallet(
  owner: Signer
): Promise<SsiWalletSession> {
  try {
    let response = await axios.get(`/ssi/wallet-api/auth/account/web3/nonce`)

    const nonce = response.data
    const payload = {
      challenge: nonce,
      signed: await owner.signMessage(nonce),
      publicKey: await owner.getAddress()
    }

    response = await axios.post(
      `/ssi/wallet-api/auth/account/web3/signed`,
      payload
    )
    return response.data?.token
  } catch (error) {
    throw error.response
  }
}

export async function disconnectFromWallet() {
  try {
    await axios.post(`/ssi/wallet-api/auth/logout`)
  } catch (error) {
    throw error.response
  }
}

export async function isSessionValid(): Promise<boolean> {
  try {
    await axios.get(`/ssi/wallet-api/auth/session`, {
      withCredentials: true
    })

    return true
  } catch (error) {
    return false
  }
}

export async function getWallets(): Promise<SsiWalletDesc[]> {
  try {
    const response = await axios.get(
      `/ssi/wallet-api/wallet/accounts/wallets`,
      { withCredentials: true }
    )

    const result: { wallets: SsiWalletDesc[] } = response.data
    return result.wallets
  } catch (error) {
    throw error.response
  }
}

export async function getWalletKeys(
  wallet: SsiWalletDesc
): Promise<SsiKeyDesc[]> {
  try {
    const response = await axios.get(
      `/ssi/wallet-api/wallet/${wallet?.id}/keys`,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletKey(walletId: string, keyId: string) {
  try {
    const response = await axios.get(
      `/ssi/wallet-api/wallet/${walletId}/keys/${keyId}/load`,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function signMessage(
  walletId: string,
  keyId: string,
  message: any
): Promise<string> {
  try {
    const response = await axios.post(
      `/ssi/wallet-api/wallet/${walletId}/keys/${keyId}/sign`,
      message,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletIssuers(
  walletId: string
): Promise<SsiWalletIssuer[]> {
  try {
    const response = await axios.get(
      `/ssi/wallet-api/wallet/${walletId}/issuers`,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function getWalletDids(walletId: string): Promise<SsiWalletDid[]> {
  try {
    const response = await axios.get(
      `/ssi/wallet-api/wallet/${walletId}/dids`,
      { withCredentials: true }
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
  presentationDefinition: any
): Promise<SsiVerifiableCredential[]> {
  try {
    const response = await axios.post(
      `/ssi/wallet-api/wallet/${walletId}/exchange/matchCredentialsForPresentationDefinition`,
      presentationDefinition,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function resolvePresentationRequest(
  walletId: string,
  presentationRequest: string
): Promise<string> {
  try {
    const response = await axios.post(
      `/ssi/wallet-api/wallet/${walletId}/exchange/resolvePresentationRequest`,
      presentationRequest,
      { withCredentials: true }
    )

    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function requestPresentationDefinition(
  presentationDefinitionUri: string
): Promise<any> {
  try {
    const response = await axios.get(`${presentationDefinitionUri}`)
    return response.data
  } catch (error) {
    throw error.response
  }
}

export async function usePresentationRequest(
  walletId: string,
  did: string,
  presentationRequest: string,
  selectedCredentials: string[]
): Promise<{ redirectUri: string }> {
  try {
    const response = await axios.post(
      `/ssi/wallet-api/wallet/${walletId}/exchange/usePresentationRequest`,
      {
        did,
        presentationRequest,
        selectedCredentials
      },
      { withCredentials: true }
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
