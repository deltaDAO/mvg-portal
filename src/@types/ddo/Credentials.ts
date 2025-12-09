export interface Credential {
  match_allow?: 'any' | 'all'
  match_deny: 'any' | 'all'
  allow?: (CredentialAddressBased | CredentialPolicyBased)[]
  deny?: CredentialAddressBased[]
}

export interface Address {
  address: string
}

export interface CredentialAddressBased {
  type: 'address'
  values: Address[]
}

export interface CredentialPolicyBased {
  type: 'SSIpolicy'
  values: PolicyValue[]
}

export interface PolicyValue {
  request_credentials: RequestCredential[]
  vp_policies: any[]
  vc_policies: VC[]
}

export interface VPValue {
  policy: string
  args?: number | string | Record<string, any>
}

export type VC = string
export type VP = string | VPValue
export interface RequestCredential {
  type: string
  format: string
  policies: any[]
}

export function isVpValue(data: any): data is VPValue {
  return (
    data &&
    typeof data === 'object' &&
    'policy' in data &&
    typeof (data as any).policy === 'string' &&
    'args' in (data as any)
  )
}
