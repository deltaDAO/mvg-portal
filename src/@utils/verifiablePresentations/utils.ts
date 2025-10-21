import {
  GaiaXCredentialSubjectType,
  GaiaXVerifiableCredential,
  GaiaXVerifiablePresentation
} from './types'

export const findVCType = (
  credentials: GaiaXVerifiablePresentation[],
  target: GaiaXCredentialSubjectType
): GaiaXVerifiableCredential[] =>
  credentials.map(
    (c) =>
      c.verifiableCredential.filter(
        (vc) => vc.credentialSubject.type === target
      )[0]
  )
