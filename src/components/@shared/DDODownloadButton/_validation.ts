import * as Yup from 'yup'

export const initialValuesAsset = {
  didweb: '',
  credentialHostingPath: '',
  pathToParticipantCredential: '',
  knownDependencyCredentials: '',
  knownAggregatedServiceCredentials: ''
}

export const validationAsset = Yup.object().shape({
  didweb: Yup.string()
    .matches(/^did:web:/, 'Invalid DID (only did:web is allowed)')
    .required('Required'),
  credentialHostingPath: Yup.string()
    .url('Invalid URL')
    .matches(/.*[^/]$/, 'URL must not end with /')
    .required('Required'),
  pathToParticipantCredential: Yup.string()
    .url('Invalid URL')
    .required('Required'),
  knownDependencyCredentials: Yup.string().optional().url('Invalid URL'),
  knownAggregatedServiceCredentials: Yup.string().optional().url('Invalid URL')
})
