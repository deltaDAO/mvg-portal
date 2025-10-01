import {
  Credential,
  CredentialAddressBased,
  CredentialPolicyBased
} from 'src/@types/ddo/Credentials'

export function isCredentialAddressBased(
  credential: CredentialAddressBased | CredentialPolicyBased
): credential is CredentialAddressBased {
  return (
    (credential as CredentialAddressBased)?.type !== undefined &&
    (credential as CredentialAddressBased)?.type === 'address'
  )
}

export function isCredentialPolicyBased(
  credential: CredentialAddressBased | CredentialPolicyBased
): credential is CredentialPolicyBased {
  return (
    (credential as CredentialPolicyBased)?.type !== undefined &&
    (credential as CredentialPolicyBased)?.type === 'SSIpolicy'
  )
}

export function requiresSsi(credentials?: Credential): boolean {
  if (!credentials || !Array.isArray(credentials.allow)) return false

  for (const entry of credentials.allow) {
    if (isCredentialPolicyBased(entry)) {
      const values = Array.isArray(entry.values) ? entry.values : []
      for (const value of values) {
        const hasRequestCredentials = Array.isArray(value.request_credentials)
          ? value.request_credentials.length > 0
          : false
        const hasVcPolicies = Array.isArray(value.vc_policies)
          ? value.vc_policies.length > 0
          : false
        const hasVpPolicies = Array.isArray(value.vp_policies)
          ? value.vp_policies.length > 0
          : false

        if (hasRequestCredentials || hasVcPolicies || hasVpPolicies) {
          return true
        }
      }
    }
  }

  return false
}
