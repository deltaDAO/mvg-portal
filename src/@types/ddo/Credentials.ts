export interface Credential {
  match_allow?: 'any' | 'all'
  match_deny: 'any' | 'all'
  allow?: (CredentialAddressBased | CredentialPolicyBased)[]
  deny?: CredentialAddressBased[]
}

export interface CredentialAddressBased {
  type: 'address'
  values: string[]
}

export interface CredentialPolicyBased {
  type: 'SSIpolicy'
  values: PolicyValue[]
}

export interface PolicyValue {
  request_credentials: RequestCredential[]
  vp_policies: VP[]
  vc_policies: VC[]
}

export interface VPValue {
  policy: string
  args: number
}

export type VC = string
export type VP = string | VPValue

export interface RequestCredential {
  type: string
  format: string
  policies: any[]
}

export function isVpType(data: any): data is VP {
  return (
    data &&
    'policy' in data &&
    typeof data.policy === 'string' &&
    'args' in data &&
    typeof data.args === 'number'
  )
}
