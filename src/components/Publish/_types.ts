import { FileInfo, ServiceComputeOptions } from '@oceanprotocol/lib'
import { NftMetadata } from '@utils/nft'
import { ReactElement } from 'react'
import { ServiceCredential } from 'src/@types/gaia-x/2210/ServiceCredential'
import { GaiaXInformation2210 } from '../../@types/gaia-x/2210/GXInformation'

export interface FormPublishService {
  files: FileInfo[]
  links?: FileInfo[]
  timeout: string
  dataTokenOptions: { name: string; symbol: string }
  access: 'Download' | 'Compute' | string
  providerUrl: { url: string; valid: boolean; custom: boolean }
  algorithmPrivacy?: boolean
  computeOptions?: ServiceComputeOptions
  usesConsumerParameters?: boolean
  consumerParameters?: FormConsumerParameter[]
  allow?: string[]
  deny?: string[]
}

export interface FormPublishData {
  user: {
    stepCurrent: number
    accountId: string
    chainId: number
  }
  metadata: {
    nft: NftMetadata
    transferable: boolean
    type: 'dataset' | 'algorithm'
    name: string
    description: string
    author: string
    termsAndConditions: boolean
    gaiaXInformation: {
      termsAndConditions: FileInfo[]
      containsPII: GaiaXInformation2210['containsPII']
      PIIInformation?: GaiaXInformation2210['PIIInformation']
      serviceSD?: ServiceCredential
    }
    license?: string
    tags?: string[]
    dockerImage?: string
    dockerImageCustom?: string
    dockerImageCustomTag?: string
    dockerImageCustomEntrypoint?: string
    dockerImageCustomChecksum?: string
    usesConsumerParameters?: boolean
    consumerParameters?: FormConsumerParameter[]
    service?: {
      usesConsumerParameters?: boolean
      consumerParameters?: FormConsumerParameter[]
    }
  }
  services: FormPublishService[]
  pricing: PricePublishOptions
  feedback?: PublishFeedback
}

export interface StepContent {
  step: number
  title: string
  component: ReactElement
}

export interface PublishFeedback {
  [key: string]: {
    name: string
    description: string
    status: 'success' | 'error' | 'pending' | 'active' | string
    txCount: number
    errorMessage?: string
    txHash?: string
  }
}

export interface MetadataAlgorithmContainer {
  entrypoint: string
  image: string
  tag: string
  checksum: string
}

export interface FormConsumerParameter {
  name: string
  type: 'text' | 'number' | 'boolean' | 'select'
  label: string
  required: string
  description: string
  default: string | boolean | number
  options?: { key: string; value: string }[]
  value?: string | boolean | number
}
