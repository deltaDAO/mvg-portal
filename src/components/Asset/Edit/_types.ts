import { FormConsumerParameter } from '@components/Publish/_types'
import { FileInfo, ServiceComputeOptions } from '@oceanprotocol/lib'

export interface MetadataEditForm {
  name: string
  description: string
  links?: FileInfo[]
  author?: string
  tags?: string[]
  usesConsumerParameters?: boolean
  consumerParameters?: FormConsumerParameter[]
  allow?: string[]
  deny?: string[]
  assetState?: string
  license?: string
}

export interface ServiceEditForm {
  name: string
  description: string
  access: 'access' | 'compute'
  compute: ServiceComputeOptions
  providerUrl: { url: string; valid: boolean; custom: boolean }
  price: number
  paymentCollector: string
  files: FileInfo[]
  timeout: string
  usesConsumerParameters: boolean
  consumerParameters: FormConsumerParameter[]
}

export interface ComputeEditForm {
  allowAllPublishedAlgorithms: boolean
  publisherTrustedAlgorithms: string[]
  publisherTrustedAlgorithmPublishers: string[]
}
