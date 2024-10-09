import { downloadJSON } from '@utils/downloadJSON'

export function createServiceCredential(asset, formData) {
  console.log('formData', formData)
  const metadata = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
      'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
    ],
    type: 'VerifiableCredential',
    id: `${formData.credentialHostingPath}/.well-known/2210_gx_service_name.json`,
    issuer: formData.didweb,
    issuanceDate: '',
    credentialSubject: {
      id: asset.id,
      type: 'gx:ServiceOffering',
      'gx:providedBy': {
        id: formData.pathToParticipantCredential
      },
      'gx:maintainedBy': {
        id: formData.pathToParticipantCredential
      },
      'gx:serviceOffering:serviceModel': 'subscription',
      'gx:serviceOffering:subscriptionDuration':
        asset.services[0].timeout || 'unlimited',
      'gx:policy': `${formData.credentialHostingPath}/yourpolicy.json`,
      'gx:termsAndConditions': {
        'gx:URL': 'https://portal.pontus-x.eu/terms',
        'gx:hash':
          'dc6cb5cd5f726e18cf14d9a17fc192a3c5239d7764d6cdb73138a8c53b550dd5f961252c8a0be4b1b8dc42260108dc65e9217053b61fec83634b3e1bb6e6822e'
      },
      'gx:dataAccountExport': {
        'gx:requestType': 'email',
        'gx:accessType': 'digital',
        'gx:formatType': 'mime/json'
      },
      'gx:serviceOffering:dataProtectionRegime': ['GDPR2016'],
      'gx:serviceOffering:gdpr': [
        {
          'gx:serviceOffering:imprint': `${formData.credentialHostingPath}/imprint/`
        },
        {
          'gx:serviceOffering:privacyPolicy': `${formData.credentialHostingPath}/privacy/`
        }
      ],
      'gx:dependsOn': formData.dependencyCredentialsList || [],
      'gx:aggregationOf': formData.serviceCredentialList || []
    }
  }
  downloadJSON(
    JSON.stringify(metadata),
    `service_did_op_${asset.id.split(':')[2]}`
  )
  console.log('metadata', metadata)
}
