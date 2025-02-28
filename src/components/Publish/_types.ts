import { CredentialForm } from '@components/@shared/PolicyEditor/types'
import { FileInfo } from '@oceanprotocol/lib'
import { NftMetadata } from '@utils/nft'
import { ReactElement } from 'react'
import { License } from 'src/@types/ddo/License'
import { Option } from 'src/@types/ddo/Option'
import { Compute } from 'src/@types/ddo/Service'

export interface FormPublishService {
  files: FileInfo[]
  links?: FileInfo[]
  timeout: string
  dataTokenOptions: { name: string; symbol: string }
  access: 'Download' | 'Compute' | string
  providerUrl: { url: string; valid: boolean; custom: boolean }
  algorithmPrivacy?: boolean
  computeOptions?: Compute
  usesConsumerParameters?: boolean
  consumerParameters?: FormConsumerParameter[]
  credentials: CredentialForm
}

export interface FormAdditionalDdo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  type: string
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
    license?: License
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
    useRemoteLicense: boolean
    licenseUrl: FileInfo[]
    uploadedLicense: License
  }
  services: FormPublishService[]
  pricing: PricePublishOptions
  feedback?: PublishFeedback
  additionalDdos: FormAdditionalDdo[]
  additionalDdosPageVisited: boolean
  previewPageVisited: boolean
  credentials: CredentialForm
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
  default: string | boolean | number | Option[]
  options?: { key: string; value: string }[]
  value?: string | boolean | number
}
