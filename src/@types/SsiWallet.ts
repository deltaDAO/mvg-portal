import { getSsiVerifiableCredentialType } from '@utils/wallet/ssiWallet'

export interface SsiWalletSession {
  session_id: string
  status: string
  token: string
  expiration: Date
}

export interface SsiWalletDesc {
  id: string
  name: string
  createdOn: Date
  addedOn: Date
  permission: string
}

export interface SsiKeyDesc {
  algorithm: string
  cryptoProvider: string
  keyId: {
    id: string
  }
}

export interface SsiVerifiableCredential {
  id: string
  parsedDocument: {
    id: string
    type: string[]
    issuer: string
    issuanceDate: Date
    credentialSubject: Record<string, any>
  }
}

export interface SsiWalletIssuer {
  wallet: string
  did: string
  description: string
  uiEndpoint: string
}

export interface SsiWalletDid {
  alias: string
  did: string
  document: string
  keyId: string
}

export class SsiWalletCache {
  credentialStorage = 'cachedCredentials'
  credentialSelectionStorage = 'credentialSelectionStorage'

  public readCredentialStorage(): SsiVerifiableCredential[] {
    let credentialStorage = []
    try {
      const cachedCredentialString = localStorage.getItem(
        this.credentialStorage
      )
      if (cachedCredentialString) {
        credentialStorage = JSON.parse(cachedCredentialString)
      }
    } catch (error) {
      credentialStorage = []
    }
    return credentialStorage
  }

  writeCredentialStorage(credentialStorage: SsiVerifiableCredential[]) {
    const credentialString = JSON.stringify(credentialStorage)
    localStorage.setItem(this.credentialStorage, credentialString)
  }

  readCredentialSelectionStorage(): string[] {
    let credentialSelectionStorage = []
    try {
      const cachedCredentialSelectionString = localStorage.getItem(
        this.credentialSelectionStorage
      )
      if (cachedCredentialSelectionString) {
        credentialSelectionStorage = JSON.parse(cachedCredentialSelectionString)
      }
    } catch (error) {
      credentialSelectionStorage = []
    }
    return credentialSelectionStorage
  }

  writeCredentialSelectionStorage(credentialSelectionStorage: string[]) {
    const credentialSelectionString = JSON.stringify(credentialSelectionStorage)
    localStorage.setItem(
      this.credentialSelectionStorage,
      credentialSelectionString
    )
  }

  public cacheCredentials(credentials: SsiVerifiableCredential[]) {
    let credentialStorage = this.readCredentialStorage()
    credentialStorage = [...credentialStorage, ...credentials]
    credentialStorage = this.removeDups(credentialStorage)
    this.writeCredentialStorage(credentialStorage)
  }

  public lookupCredentials(
    credentialTypes: string[]
  ): SsiVerifiableCredential[] {
    const credentialStorage = this.readCredentialStorage()
    return credentialStorage.filter((credential) => {
      const credentialType = getSsiVerifiableCredentialType(credential)
      return credentialTypes.includes(credentialType)
    })
  }

  public clearCredentials() {
    localStorage.removeItem(this.credentialStorage)
  }

  public cacheCredentialSelection(credentialSelection: string[]) {
    let credentialSelectionStorage = this.readCredentialSelectionStorage()
    credentialSelectionStorage = [
      ...credentialSelectionStorage,
      ...credentialSelection
    ]
    credentialSelectionStorage = this.removeDups(credentialSelectionStorage)
    this.writeCredentialSelectionStorage(credentialSelectionStorage)
  }

  public lookupCredentialSelection(): string[] {
    return this.readCredentialSelectionStorage()
  }

  private removeDups<T>(array: T[]): T[] {
    const seen = new Map<string, T>()
    const result = array.filter((item) => {
      const serialized = JSON.stringify(item)
      if (seen.has(serialized)) {
        return false
      } else {
        seen.set(serialized, item)
        return true
      }
    })
    return result
  }
}
