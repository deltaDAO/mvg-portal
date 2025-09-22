import { LanguageValueObject } from './LanguageValueObject'
import { License } from './License'
import { RemoteObject } from './RemoteObject'
import { Option } from './Option'

export interface Container {
  entrypoint: string
  image: string
  tag: string
  checksum: string
}

export interface Algorithm {
  container: Container
  language?: string
  version?: string
  consumerParameters?: Record<string, string | number | boolean | Option[]>[]
}

export interface Metadata {
  created: string
  updated: string
  description: LanguageValueObject
  copyrightHolder: string
  name: string
  // symbol: string;
  displayTitle?: LanguageValueObject
  type: string
  author?: string
  providedBy: string
  license?: License
  links?: Record<string, string>
  attachments?: RemoteObject[]
  tags?: string[]
  categories?: string[]
  additionalInformation?: Record<string, string | number | boolean>
  // Required if asset type is algorithm
  algorithm?: Algorithm
}

export interface MetadataProof {
  validatorAddress?: string
  r?: string
  s?: string
  v?: number
}
export interface ValidateMetadata {
  valid: boolean
  errors?: any
  hash?: string
  proof?: MetadataProof
}
