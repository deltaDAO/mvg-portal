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

  public readCredentialStorage(): Record<string, SsiVerifiableCredential[]> {
    let credentialStorage: Record<string, SsiVerifiableCredential[]> = {}
    try {
      const cachedCredentialString = localStorage.getItem(
        this.credentialStorage
      )
      if (cachedCredentialString) {
        credentialStorage = JSON.parse(cachedCredentialString)
      }
    } catch (error) {
      credentialStorage = {}
    }
    return credentialStorage
  }

  writeCredentialStorage(
    credentialStorage: Record<string, SsiVerifiableCredential[]>
  ) {
    const credentialString = JSON.stringify(credentialStorage)
    localStorage.setItem(this.credentialStorage, credentialString)
  }

  readCredentialSelectionStorage(): Record<string, string[]> {
    let credentialSelectionStorage: Record<string, string[]> = {}
    try {
      const cachedCredentialSelectionString = localStorage.getItem(
        this.credentialSelectionStorage
      )
      if (cachedCredentialSelectionString) {
        credentialSelectionStorage = JSON.parse(cachedCredentialSelectionString)
      }
    } catch (error) {
      credentialSelectionStorage = {}
    }
    return credentialSelectionStorage
  }

  writeCredentialSelectionStorage(
    credentialSelectionStorage: Record<string, string[]>
  ) {
    const credentialSelectionString = JSON.stringify(credentialSelectionStorage)
    localStorage.setItem(
      this.credentialSelectionStorage,
      credentialSelectionString
    )
  }

  public cacheCredentials(did: string, credentials: SsiVerifiableCredential[]) {
    const credentialStorage = this.readCredentialStorage()
    const oldList = credentialStorage[did] || []
    credentialStorage[did] = [...oldList, ...credentials]
    credentialStorage[did] = this.removeDups(credentialStorage[did])
    this.writeCredentialStorage(credentialStorage)
  }

  public lookupCredentials(
    did: string,
    credentialTypes: string[]
  ): SsiVerifiableCredential[] {
    const credentialStorage = this.readCredentialStorage()
    return (
      credentialStorage[did]?.filter((credential) => {
        const credentialType = getSsiVerifiableCredentialType(credential)
        return credentialTypes.includes(credentialType)
      }) || []
    )
  }

  public clearCredentials() {
    localStorage.removeItem(this.credentialStorage)
  }

  public cacheCredentialSelection(did: string, credentialSelection: string[]) {
    const credentialSelectionStorage = this.readCredentialSelectionStorage()
    const oldList = credentialSelectionStorage[did] || []
    credentialSelectionStorage[did] = [...oldList, ...credentialSelection]
    credentialSelectionStorage[did] = this.removeDups(
      credentialSelectionStorage[did]
    )
    this.writeCredentialSelectionStorage(credentialSelectionStorage)
  }

  public lookupCredentialSelection(did: string): string[] {
    const selections = this.readCredentialSelectionStorage()
    return selections[did] || []
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
