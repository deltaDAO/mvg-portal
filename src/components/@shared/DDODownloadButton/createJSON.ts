import { downloadJSON } from '@utils/downloadJSON'

export function createServiceCredential(asset, formData) {
  const metadata = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
      'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
    ],
    type: 'VerifiableCredential',
    id: `${formData.get(
      'credentialHostingPath'
    )}/.well-known/2210_gx_service_name.json`,
    issuer: formData.get('didweb'),
    issuanceDate: '',
    credentialSubject: {
      id: asset.id,
      type: 'gx:ServiceOffering',
      'gx:providedBy': {
        id: formData.get('pathToParticipantCredential')
      },
      'gx:maintainedBy': {
        id: formData.get('pathToParticipantCredential')
      },
      'gx:serviceOffering:type': "['data', 'software', 'SaaS']",
      'gx:serviceOffering:serviceModel': 'subscription',
      'gx:serviceOffering:subscriptionDuration':
        asset.services[0].timeout || 'unlimited',
      'gx:policy': `${formData.get('credentialHostingPath')}/yourpolicy.json`,
      'gx:termsAndConditions': {
        'gx:URL':
          asset.metadata.additionalInformation.gaiaXInformation
            .termsAndConditions[0].url[0],
        'gx:hash': '[SHA256 Hash of the Terms and Condition Document]'
      },
      'gx:dataAccountExport': {
        'gx:requestType': 'email',
        'gx:accessType': 'digital',
        'gx:formatType': 'mime/json'
      },
      'gx:serviceOffering:dataProtectionRegime': ['GDPR2016'],
      'gx:serviceOffering:gdpr': [
        {
          'gx:serviceOffering:imprint': `${formData.get(
            'credentialHostingPath'
          )}/imprint/`
        },
        {
          'gx:serviceOffering:privacyPolicy': `${formData.get(
            'credentialHostingPath'
          )}/privacy/`
        }
      ],
      'gx:dependsOn': JSON.parse(formData.get('dependencyCredentials')) || [],
      'gx:aggregationOf': JSON.parse(formData.get('serviceCredential')) || []
    }
  }
  downloadJSON(metadata, `service_did_op_${asset.id.split(':')[2]}`)
}
