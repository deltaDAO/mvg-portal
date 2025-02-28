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
