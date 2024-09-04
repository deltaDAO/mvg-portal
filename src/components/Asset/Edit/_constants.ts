import {
  Credentials,
  Metadata,
  Service,
  ServiceComputeOptions
} from '@oceanprotocol/lib'
import { parseConsumerParameters, secondsToString } from '@utils/ddo'
import {
  AddServiceForm,
  ComputeEditForm,
  MetadataEditForm,
  ServiceEditForm
} from './_types'

export function getInitialValues(
  metadata: Metadata,
  credentials: Credentials,
  assetState: string
): Partial<MetadataEditForm> {
  return {
    name: metadata?.name,
    description: metadata?.description,
    links: [{ url: '', type: 'url' }],
    author: metadata?.author,
    tags: metadata?.tags,
    usesConsumerParameters: metadata?.algorithm?.consumerParameters?.length > 0,
    consumerParameters: parseConsumerParameters(
      metadata?.algorithm?.consumerParameters
    ),
    allow:
      credentials?.allow?.find((credential) => credential.type === 'address')
        ?.values || [],
    deny:
      credentials?.deny?.find((credential) => credential.type === 'address')
        ?.values || [],
    assetState,
    license: metadata?.license
  }
}

export const getNewServiceInitialValues = (
  accountId: string,
  firstService: Service
): AddServiceForm => {
  console.log('firs', firstService)
  return {
    name: 'New Service',
    description: '',
    access: 'access',
    price: 1,
    paymentCollector: accountId,
    providerUrl: {
      url: firstService.serviceEndpoint,
      valid: false,
      custom: false
    },
    files: [{ url: '', type: 'hidden' }],
    timeout: '1 day',
    usesConsumerParameters: false,
    consumerParameters: []
  }
}

export const getServiceInitialValues = (
  service: Service,
  accessDetails: AccessDetails
): ServiceEditForm => {
  return {
    name: service.name,
    description: service.description,
    price: parseFloat(accessDetails.price),
    paymentCollector: accessDetails.paymentCollector,
    files: [{ url: '', type: 'hidden' }],
    timeout: secondsToString(service.timeout),
    usesConsumerParameters: service.consumerParameters?.length > 0,
    consumerParameters: parseConsumerParameters(service.consumerParameters)
  }
}

export function getComputeSettingsInitialValues({
  publisherTrustedAlgorithms,
  publisherTrustedAlgorithmPublishers
}: ServiceComputeOptions): ComputeEditForm {
  const allowAllPublishedAlgorithms = publisherTrustedAlgorithms === null
  const publisherTrustedAlgorithmsForForm = allowAllPublishedAlgorithms
    ? null
    : publisherTrustedAlgorithms.map((algo) => algo.did)

  return {
    allowAllPublishedAlgorithms,
    publisherTrustedAlgorithms: publisherTrustedAlgorithmsForForm,
    publisherTrustedAlgorithmPublishers
  }
}
