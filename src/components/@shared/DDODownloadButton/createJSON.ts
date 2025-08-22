import { downloadJSON } from '@utils/downloadJSON'

export interface DDOData {
  id: string
  services: { timeout: string }[]
}

interface FormData {
  didweb: string
  credentialHostingPath: string
  pathToParticipantCredential: string
  dependencyCredentialsList: { id: string }[]
  serviceCredentialList: { id: string }[]
}

function getDomain(url: string) {
  url = url.split('/').splice(0, 3).join('/')
  return url
}

export function createServiceCredential(asset: DDOData, formData: FormData) {
  const filename = `service_did_op_${asset.id.split(':')[2]}` // to get only the id without did:op:
  const metadata = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
      'https://registry.lab.gaia-x.eu/development/api/trusted-shape-registry/v1/shapes/jsonld/trustframework#'
    ],
    type: 'VerifiableCredential',
    id: `${formData.credentialHostingPath}/${filename}.json`,
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
        'gx:URL': '[basedomain]/yourtermsandconditions.txt',
        'gx:hash': '[hash]'
      },
      'gx:dataAccountExport': {
        'gx:requestType': 'email',
        'gx:accessType': 'digital',
        'gx:formatType': 'mime/json'
      },
      'gx:serviceOffering:dataProtectionRegime': ['GDPR2016'],
      'gx:serviceOffering:gdpr': [
        {
          'gx:serviceOffering:imprint': `${getDomain(
            formData.credentialHostingPath
          )}/imprint/`
        },
        {
          'gx:serviceOffering:privacyPolicy': `${getDomain(
            formData.credentialHostingPath
          )}/privacy/`
        }
      ],
      'gx:dependsOn': formData.dependencyCredentialsList || [],
      'gx:aggregationOf': formData.serviceCredentialList || []
    }
  }
  downloadJSON(JSON.stringify(metadata), filename)
}
