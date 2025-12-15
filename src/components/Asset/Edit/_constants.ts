import { assetStateToString } from '@utils/assetState'
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
import { State } from 'src/@types/ddo/State'

export const defaultServiceComputeOptions: Compute = {
  allowRawAlgorithm: false,
  allowNetworkAccess: true,
  publisherTrustedAlgorithmPublishers: [],
  publisherTrustedAlgorithms: []
}

function generateCredentials(
  credentials: Credential,
  type?: string
): CredentialForm {
  const credentialForm: CredentialForm = {
    vpPolicies: [],
    allowInputValue: '',
    denyInputValue: '',
    externalEvpForwardUrl: ''
  }
  if (appConfig.ssiEnabled) {
    const requestCredentials: RequestCredentialForm[] = []
    let vcPolicies: string[] = []
    let vpPolicies: VpPolicyType[] = []
    credentials.allow?.forEach((policyCredential) => {
      if (isCredentialPolicyBased(policyCredential)) {
        policyCredential.values.forEach((value) => {
          value.request_credentials.forEach((requestCredential) => {
            let policyTypes = (requestCredential?.policies ?? []).map(
              (policy) => {
                try {
                  const newPolicy = convertToPolicyType(policy, type)
                  return newPolicy
                } catch (error) {
                  LoggerInstance.error(error)
                  return undefined
                }
              }
            )
            policyTypes = policyTypes.filter((item) => !!item)

            const newRequestCredential: RequestCredentialForm = {
              format: requestCredential.format,
              type: requestCredential.type,
              policies: policyTypes
            }
            requestCredentials.push(newRequestCredential)
          })

          const newVpPolicies: VpPolicyType[] = Array.isArray(value.vp_policies)
            ? value.vp_policies.map((policy) => {
                if (
                  typeof policy === 'object' &&
                  policy !== null &&
                  'policy' in policy &&
                  !('args' in policy)
                ) {
                  const result: StaticVpPolicy = {
                    type: 'staticVpPolicy',
                    name: (policy as any).policy
                  }
                  return result
                }

                if (isVpValue(policy)) {
                  if (
                    policy.policy === 'external-evp-forward' &&
                    typeof policy.args === 'string'
                  ) {
                    credentialForm.externalEvpForwardUrl = policy.args
                    return {
                      type: 'externalEvpForwardVpPolicy',
                      url: policy.args
                    }
                  }

                  if (
                    (policy.policy === 'holder-binding' ||
                      policy.policy === 'presentation-definition') &&
                    (policy.args === undefined ||
                      policy.args === null ||
                      (typeof policy.args === 'string' &&
                        policy.args.length === 0))
                  ) {
                    const result: StaticVpPolicy = {
                      type: 'staticVpPolicy',
                      name: policy.policy
                    }
                    return result
                  }

                  const result: ArgumentVpPolicy = {
                    type: 'argumentVpPolicy',
                    policy: policy.policy,
                    args: String(policy.args)
                  }
                  return result
                } else {
                  const result: StaticVpPolicy = {
                    type: 'staticVpPolicy',
                    name: policy as string
                  }
                  return result
                }
              })
            : []

          vcPolicies = [
            ...vcPolicies,
            ...(Array.isArray(value.vc_policies) ? value.vc_policies : [])
          ]
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

function safeParse(val: any) {
  if (typeof val === 'string') {
    try {
      const result = JSON.parse(val)
      if (Array.isArray(result.required)) {
        result.required.forEach((item, idx) => console.log(idx, item))
      }
      return result
    } catch {
      return val
    }
  }
  return val
}

function syncVpRequiredPoliciesAndCredentials(credentialForm: any) {
  function genId() {
    return Math.random().toString(36).slice(2)
  }

  // Safe parse on args for every policy
  if (Array.isArray(credentialForm.vpPolicies)) {
    credentialForm.vpPolicies = credentialForm.vpPolicies.map((vp) =>
      vp && typeof vp === 'object' && 'args' in vp
        ? { ...vp, args: safeParse(vp.args) }
        : vp
    )
  }

  // Build vpRequiredCredentials from the canonical policy (if available)
  const foundPolicy = credentialForm.vpPolicies.find(
    (vp: any) =>
      typeof vp === 'object' &&
      vp.policy === 'vp_required_credentials' &&
      'args' in vp &&
      vp.args &&
      typeof vp.args === 'object'
  )

  // Build from policy if present, else from current UI state
  const newVpRequiredCredentials: any[] = []
  if (foundPolicy && Array.isArray(foundPolicy.args.required)) {
    foundPolicy.args.required.forEach((req: any) => {
      // Support policy, credential_type, any_of
      if (req.policy) {
        newVpRequiredCredentials.push({
          id: genId(),
          credential_type: req.policy
        })
      }
      if (req.credential_type) {
        newVpRequiredCredentials.push({
          id: genId(),
          credential_type: req.credential_type
        })
      }
      if (Array.isArray(req.any_of)) {
        newVpRequiredCredentials.push({
          any_of: req.any_of
        })
      }
    })
  }

  credentialForm.vpRequiredCredentials = newVpRequiredCredentials

  // If there is a UI edit to the required credentials, keep vpPolicies up to date!
  if (foundPolicy) {
    // Build required from current credentials state
    foundPolicy.args.required = credentialForm.vpRequiredCredentials.map(
      (item: any) =>
        'credential_type' in item
          ? { credential_type: item.credential_type }
          : { any_of: item.any_of }
    )
  }
  // Remove duplicate or stale argumentVpPolicy with non-empty required array
  if (credentialForm?.vpPolicies && Array.isArray(credentialForm.vpPolicies)) {
    credentialForm.vpPolicies = credentialForm.vpPolicies.filter(
      (vp: any) =>
        !(
          vp &&
          vp.type === 'argumentVpPolicy' &&
          vp.args &&
          Array.isArray(vp.args.required) &&
          vp.args.required.length > 0
        )
    )
  }
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
  const credentialForm = generateCredentials(credentials, 'edit')
  syncVpRequiredPoliciesAndCredentials(credentialForm)

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
  // Determine if "allow all" is set either via wildcard publishers or a wildcard algorithm entry
  const hasWildcardPublishers =
    Array.isArray(publisherTrustedAlgorithmPublishers) &&
    publisherTrustedAlgorithmPublishers.includes('*')

  let hasWildcardAlgorithms = false
  if (
    Array.isArray(publisherTrustedAlgorithms) &&
    publisherTrustedAlgorithms.length === 1
  ) {
    const a = publisherTrustedAlgorithms[0] as any
    hasWildcardAlgorithms =
      a?.did === '*' &&
      a?.containerSectionChecksum === '*' &&
      a?.filesChecksum === '*' &&
      a?.serviceId === '*'
  }

  const allowAllPublishedAlgorithms =
    hasWildcardPublishers || hasWildcardAlgorithms

  const publisherTrustedAlgorithmsForForm = allowAllPublishedAlgorithms
    ? []
    : publisherTrustedAlgorithms.map((algo) =>
        JSON.stringify({
          algoDid: algo.did,
          serviceId: algo.serviceId
        })
      )

  const publisherTrustedAlgorithmPublishersValue = hasWildcardPublishers
    ? 'Allow all trusted algorithm publishers'
    : 'Allow specific trusted algorithm publishers'

  return {
    allowAllPublishedAlgorithms,
    publisherTrustedAlgorithms: publisherTrustedAlgorithmsForForm,
    publisherTrustedAlgorithmPublishers:
      publisherTrustedAlgorithmPublishersValue,
    publisherTrustedAlgorithmPublishersAddresses: hasWildcardPublishers
      ? ''
      : publisherTrustedAlgorithmPublishers?.join(',') || ''
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
    description: 'New description',
    language: '',
    direction: '',
    access: 'access',
    price: 1,
    paymentCollector: accountId,
    providerUrl: {
      url: firstService.serviceEndpoint,
      valid: false,
      custom: false
    },
    files: [{ url: '', type: 'url' }],
    state: assetStateToString(State.Active),
    timeout: '1 day',
    usesConsumerParameters: false,
    consumerParameters: [],
    credentials: {
      allow: [],
      deny: [],
      allowInputValue: '',
      denyInputValue: '',
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
  const credentialForm = generateCredentials(service.credentials, 'edit')

  return {
    name: service.name,
    description: service.description?.['@value'],
    direction: service.description?.['@direction'],
    language: service.description?.['@language'],
    access: service.type as 'access' | 'compute',
    price: isNaN(parseFloat(accessDetails.price))
      ? 0.000001
      : parseFloat(accessDetails.price),
    paymentCollector: accessDetails.paymentCollector,
    providerUrl: {
      url: service.serviceEndpoint,
      valid: true,
      custom: false
    },
    files:
      Array.isArray(service.files) && service.files.length > 0
        ? service.files.map((f: FileInfo) => ({ ...f, valid: true }))
        : [{ url: '', type: 'hidden', valid: true } as FileInfo],
    state: assetStateToString(service.state),
    timeout: secondsToString(service.timeout),
    usesConsumerParameters: service.consumerParameters
      ? Object.assign(service.consumerParameters).length > 0
      : undefined,
    consumerParameters: parseConsumerParameters(service.consumerParameters),
    credentials: credentialForm,
    ...computeSettings
  }
}
