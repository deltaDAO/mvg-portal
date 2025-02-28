import {
  FormAdditionalDdo,
  FormConsumerParameter
} from '@components/Publish/_types'
import { FileInfo } from '@oceanprotocol/lib'
import { License } from '../../../@types/ddo/License'
import { CredentialForm } from '@components/@shared/PolicyEditor/types'

export interface MetadataEditForm {
  name: string
  description: string
  type: string
  links?: FileInfo[]
  author?: string
  tags?: string[]
  usesConsumerParameters?: boolean
  consumerParameters?: FormConsumerParameter[]
  credentials: CredentialForm
  assetState?: string
  license?: License
  useRemoteLicense: boolean
  licenseUrl: FileInfo[]
  uploadedLicense: License
  additionalDdos: FormAdditionalDdo[]
}

export interface ServiceEditForm {
  name: string
  description: string
  access: 'access' | 'compute'
  providerUrl: { url: string; valid: boolean; custom: boolean }
  price: number
  paymentCollector: string
  files: FileInfo[]
  timeout: string
  usesConsumerParameters: boolean
  consumerParameters: FormConsumerParameter[]
  credentials: CredentialForm
  // compute
  allowAllPublishedAlgorithms: boolean
  publisherTrustedAlgorithms: string[]
  publisherTrustedAlgorithmPublishers: string[]
}

// TODO delete
export interface ComputeEditForm {
  allowAllPublishedAlgorithms: boolean
  publisherTrustedAlgorithms: string[]
  publisherTrustedAlgorithmPublishers: string[]
}
