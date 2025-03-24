import { FileInfo, LoggerInstance } from '@oceanprotocol/lib'
import { parseConsumerParameters, secondsToString } from '@utils/ddo'
import { ComputeEditForm, MetadataEditForm, ServiceEditForm } from './_types'
import { Metadata } from 'src/@types/ddo/Metadata'
import { Credential, isVpValue } from 'src/@types/ddo/Credentials'
import { Compute, Service } from 'src/@types/ddo/Service'
import {
  isCredentialAddressBased,
  isCredentialPolicyBased
} from '@utils/credentials'
import appConfig from 'app.config.cjs'
import {
  ArgumentVpPolicy,
  CredentialForm,
  RequestCredentialForm,
  StaticVpPolicy,
  VpPolicyType
} from '@components/@shared/PolicyEditor/types'
import { convertToPolicyType } from '@components/@shared/PolicyEditor/utils'
import { AdditionalVerifiableCredentials } from 'src/@types/ddo/AdditionalVerifiableCredentials'

export const defaultServiceComputeOptions: Compute = {
  allowRawAlgorithm: false,
  allowNetworkAccess: true,
  publisherTrustedAlgorithmPublishers: [],
  publisherTrustedAlgorithms: []
}

function generateCredentials(credentials: Credential): CredentialForm {
  const credentialForm: CredentialForm = {}

  if (appConfig.ssiEnabled) {
    const requestCredentials: RequestCredentialForm[] = []
    let vcPolicies: string[] = []
    let vpPolicies: VpPolicyType[] = []
    credentials.allow?.forEach((policyCredential) => {
      if (isCredentialPolicyBased(policyCredential)) {
        policyCredential.values.forEach((value) => {
          value.request_credentials.forEach((requestCredential) => {
            let policyTypes = requestCredential.policies.map((policy) => {
              try {
                return convertToPolicyType(policy)
              } catch (error) {
                LoggerInstance.error(error)
                return undefined
              }
            })
            policyTypes = policyTypes.filter((item) => !!item)

            const newRequestCredential: RequestCredentialForm = {
              format: requestCredential.format,
              type: requestCredential.type,
              policies: policyTypes
            }
            requestCredentials.push(newRequestCredential)
          })

          const newVpPolicies: VpPolicyType[] = value.vp_policies.map(
            (policy) => {
              if (isVpValue(policy)) {
                const result: ArgumentVpPolicy = {
                  type: 'argumentVpPolicy',
                  policy: policy.policy,
                  args: policy.args.toString()
                }
                return result
              } else {
                const result: StaticVpPolicy = {
                  type: 'staticVpPolicy',
                  name: policy
                }
                return result
              }
            }
          )

          vcPolicies = [...vcPolicies, ...value.vc_policies]
          vpPolicies = [...vpPolicies, ...newVpPolicies]
        })
      }
    })

    credentialForm.requestCredentials = requestCredentials
    credentialForm.vcPolicies = vcPolicies
    credentialForm.vpPolicies = vpPolicies
  }

  let allowAddresses = []
  credentials.allow?.forEach((allowCredential) => {
    if (isCredentialAddressBased(allowCredential)) {
      const addresses = allowCredential.values.map((item) => item.address)
      allowAddresses = [...allowAddresses, ...addresses]
    }
  })
  allowAddresses = Array.from(new Set(allowAddresses))
  credentialForm.allow = allowAddresses

  let denyAddresses = []
  credentials.deny?.forEach((denyCredential) => {
    if (isCredentialAddressBased(denyCredential)) {
      const addresses = denyCredential.values.map((item) => item.address)
      denyAddresses = [...denyAddresses, ...addresses]
    }
  })
  denyAddresses = Array.from(new Set(denyAddresses))
  credentialForm.deny = denyAddresses
  return credentialForm
}

export function getInitialValues(
  metadata: Metadata,
  credentials: Credential,
  additionalDdos: AdditionalVerifiableCredentials[],
  assetState: string
): MetadataEditForm {
  const useRemoteLicense =
    metadata.license?.licenseDocuments?.[0]?.mirrors?.[0]?.type !== 'url'

  let fileInfo: FileInfo
  if (
    !useRemoteLicense &&
    metadata.license?.licenseDocuments?.[0].mirrors?.[0]
  ) {
    const licenseItem = metadata.license?.licenseDocuments?.[0]
    fileInfo = {
      type: licenseItem.mirrors[0].type,
      checksum: licenseItem.sha256,
      contentLength: '',
      contentType: licenseItem.fileType,
      index: 0,
      method: licenseItem.mirrors[0].method,
      url: licenseItem.mirrors[0].url,
      valid: true
    }
  }

  const credentialForm = generateCredentials(credentials)

  return {
    name: metadata?.name,
    description: metadata?.description?.['@value'],
    type: metadata?.type,
    links: [{ url: '', type: 'url' }],
    author: metadata?.author,
    tags: metadata?.tags,
    usesConsumerParameters: metadata?.algorithm?.consumerParameters
      ? Object.values(metadata?.algorithm?.consumerParameters).length > 0
      : false,
    consumerParameters: parseConsumerParameters(
      metadata?.algorithm?.consumerParameters
    ),
    credentials: credentialForm,
    assetState,
    licenseUrl: !useRemoteLicense ? [fileInfo] : [{ url: '', type: 'url' }],
    uploadedLicense: useRemoteLicense ? metadata.license : undefined,
    useRemoteLicense,
    additionalDdos
  }
}

function getComputeSettingsInitialValues({
  publisherTrustedAlgorithms,
  publisherTrustedAlgorithmPublishers
}: Compute): ComputeEditForm {
  const allowAllPublishedAlgorithms = publisherTrustedAlgorithms === null
  const publisherTrustedAlgorithmsForForm = allowAllPublishedAlgorithms
    ? null
    : publisherTrustedAlgorithms.map((algo) => algo.did)

  return {
    allowAllPublishedAlgorithms,
    publisherTrustedAlgorithms: publisherTrustedAlgorithmsForForm || [],
    publisherTrustedAlgorithmPublishers
  }
}

export const getNewServiceInitialValues = (
  accountId: string,
  firstService: Service
): ServiceEditForm => {
  const computeSettings = getComputeSettingsInitialValues(
    defaultServiceComputeOptions
  )
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
    consumerParameters: [],
    credentials: {
      allow: [],
      deny: [],
      requestCredentials: [],
      vcPolicies: [],
      vpPolicies: []
    },
    ...computeSettings
  }
}

export const getServiceInitialValues = (
  service: Service,
  accessDetails: AccessDetails
): ServiceEditForm => {
  const computeSettings = getComputeSettingsInitialValues(
    service.compute || defaultServiceComputeOptions
  )

  const credentialForm = generateCredentials(service.credentials)

  return {
    name: service.name,
    description: service.description?.['@value'],
    access: service.type as 'access' | 'compute',
    price: parseFloat(accessDetails.price),
    paymentCollector: accessDetails.paymentCollector,
    providerUrl: {
      url: service.serviceEndpoint,
      valid: true,
      custom: false
    },
    files: [{ url: '', type: 'hidden' }],
    timeout: secondsToString(service.timeout),
    usesConsumerParameters: service.consumerParameters
      ? Object.assign(service.consumerParameters).length > 0
      : undefined,
    consumerParameters: parseConsumerParameters(service.consumerParameters),
    credentials: credentialForm,
    ...computeSettings
  }
}
