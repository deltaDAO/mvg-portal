import {
  Metadata,
  File,
  AdditionalInformation,
  ServiceMetadata
} from '@oceanprotocol/lib'
import { DataTokenOptions } from '../hooks/usePublish'
import { PriceOptions } from '../hooks/usePricing'

export interface ServiceSelfDescription {
  name?: string
  url?: string
  type?: string
  raw?: any
}
export interface AdditionalInformationMarket extends AdditionalInformation {
  links?: EditableMetadataLinks[]
  serviceSelfDescription?: Pick<ServiceSelfDescription, 'raw' | 'url'>
  termsAndConditions?: boolean
  consent: {
    noPersonalData: boolean
  }
}

export interface MetadataMarket extends Metadata {
  // While required for this market, Aquarius/Plecos will keep this as optional
  // allowing external pushes of assets without `additionalInformation`.
  // Making it optional here helps safeguarding against those assets.
  additionalInformation?: AdditionalInformationMarket
}

export interface PriceOptionsMarket extends PriceOptions {
  weightOnOcean: string
  // easier to keep this as number for Yup input validation
  swapFee: number
}

export interface MetadataPublishFormDataset {
  // ---- required fields ----
  name: string
  description: string
  files: string | File[]
  author: string
  timeout: string
  dataTokenOptions: DataTokenOptions
  access: 'Download' | 'Compute' | string
  termsAndConditions: boolean
  noPersonalData: boolean
  // ---- optional fields ----
  tags?: string
  links?: string | EditableMetadataLinks[]
  providerUri?: string
  serviceSelfDescription?: string | ServiceSelfDescription[]
}

export interface MetadataPublishFormAlgorithm {
  // ---- required fields ----
  name: string
  description: string
  files: string | File[]
  author: string
  dockerImage: string
  algorithmPrivacy: boolean
  timeout: string
  dataTokenOptions: DataTokenOptions
  termsAndConditions: boolean
  noPersonalData: boolean
  // ---- optional fields ----
  image: string
  containerTag: string
  entrypoint: string
  tags?: string
  providerUri?: string
  serviceSelfDescription?: string | ServiceSelfDescription[]
}

export interface MetadataEditForm {
  name: string
  description: string
  timeout: string
  price?: number
  links?: string | EditableMetadataLinks[]
  serviceSelfDescription?: ServiceSelfDescription[]
  author?: string
}

export interface ServiceMetadataMarket extends ServiceMetadata {
  attributes: MetadataMarket
}
