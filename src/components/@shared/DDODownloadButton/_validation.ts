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
    .matches(/^did:web:/, 'Invalid DID')
    .required('Required'),
  credentialHostingPath: Yup.string().url('Invalid URL').required('Required'),
  pathToParticipantCredential: Yup.string()
    .url('Invalid URL')
    .required('Required'),
  knownDependencyCredentials: Yup.string().url('Invalid URL'),
  knownAggregatedServiceCredentials: Yup.string().url('Invalid URL')
})
