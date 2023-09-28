import { Credentials } from '@oceanprotocol/lib'

export function updateCredentials(
  oldCredentials: Credentials,
  updatedAllow: string[],
  updatedDeny: string[]
): Credentials {
  const updatedCredentials = {
    allow: oldCredentials?.allow || [],
    deny: oldCredentials?.deny || []
  }

  const credentialTypes = [
    { type: 'allow', values: updatedAllow },
    { type: 'deny', values: updatedDeny }
  ]

  credentialTypes.forEach((credentialType) => {
    updatedCredentials[credentialType.type] = [
      ...updatedCredentials[credentialType.type].filter(
        (credential) => credential?.type !== 'address'
      ),
      { type: 'address', values: credentialType.values }
    ]
  })

  return updatedCredentials
}
