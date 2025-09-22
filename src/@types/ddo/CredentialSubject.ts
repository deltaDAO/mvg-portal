import { Metadata } from './Metadata'
import { Service } from './Service'
import { Event } from './Event'
import { Credential } from './Credentials'
import { AssetDatatoken } from '../Asset'

export interface CredentialSubject {
  metadata: Metadata
  services: Service[]
  credentials: Credential
  chainId: number
  nftAddress: string
  event?: Event
  datatokens?: AssetDatatoken[]
}
