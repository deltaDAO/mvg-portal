export interface ServiceCredentials {
  verifiableCredential: EnvelopedVerifiableCredential[]
}

export interface EnvelopedVerifiableCredential {
  '@context': string
  id: string // Unique identifier
  type: 'EnvelopedVerifiableCredential'
}
