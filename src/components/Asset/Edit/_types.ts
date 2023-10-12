import { FormConsumerParameter } from '@components/Publish/_types'
import { FileInfo } from '@oceanprotocol/lib'
import { GaiaXInformation2210 } from 'src/@types/gaia-x/2210/GXInformation'
import { ServiceCredential } from 'src/@types/gaia-x/2210/ServiceCredential'
export interface MetadataEditForm {
  name: string
  description: string
  timeout: string
  paymentCollector: string
  price?: string
  files: FileInfo[]
  links?: FileInfo[]
  author?: string
  tags?: string[]
  usesConsumerParameters?: boolean
  consumerParameters?: FormConsumerParameter[]
  allow?: string[]
  deny?: string[]
  assetState?: string
  service?: {
    usesConsumerParameters?: boolean
    consumerParameters?: FormConsumerParameter[]
  }
  gaiaXInformation?: {
    termsAndConditions: FileInfo[]
    containsPII: GaiaXInformation2210['containsPII']
    PIIInformation?: GaiaXInformation2210['PIIInformation']
    serviceSD?: ServiceCredential
  }
  license?: string
}

export interface ComputeEditForm {
  allowAllPublishedAlgorithms: boolean
  publisherTrustedAlgorithms: string[]
  publisherTrustedAlgorithmPublishers: string[]
}
