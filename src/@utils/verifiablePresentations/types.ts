import * as z from 'zod'
import * as schemas from './schemas'

export type GaiaXVerifiableCredential = z.infer<
  typeof schemas.GaiaXVerifiableCredentialSchema
>

export type GaiaXVerifiablePresentation = z.infer<
  typeof schemas.GaiaXVerifiablePresentationSchema
>

export type GaiaXVerifiablePresentationArray = z.infer<
  typeof schemas.GaiaXVerifiablePresentationArraySchema
>

export type GaiaXCredentialSubjectType = z.infer<
  typeof schemas.GaiaXCredentialType
>

export type PontusVerifiableCredential = z.infer<
  typeof schemas.PontusVerifiableCredentialSchema
>

export type PontusVerifiableCredentialArray = z.infer<
  typeof schemas.PontusVerifiableCredentialArraySchema
>
