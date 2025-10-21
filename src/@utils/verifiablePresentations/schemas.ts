import * as z from 'zod'

export const PontusVerifiableCredentialSchema = z
  .object({
    'Participant (Gaia-X Loire)': z.string(),
    'Public Address': z.string(),
    Status: z.string().optional(),
    'Gaia-X Participant 22.10 Credential': z.url().optional()
  })
  .transform((object) => ({
    participant: object['Participant (Gaia-X Loire)'],
    address: object['Public Address'],
    status: object.Status,
    credentialUrl: object['Gaia-X Participant 22.10 Credential']
  }))

export const PontusVerifiableCredentialArraySchema =
  PontusVerifiableCredentialSchema.array()

export const GaiaXCredentialType = z.enum([
  'gx:legalRegistrationNumber',
  'gx:LegalParticipant',
  'gx:GaiaXTermsAndConditions'
])

const GaiaXCredentialSubjectLegalParticipantSchema = z.object({
  id: z.string(),
  type: z.literal('gx:LegalParticipant'),
  'gx:name': z.string().optional(),
  'gx:legalName': z.string(),
  'gx:website': z.url().optional(),
  'gx:legalRegistrationNumber': z.object({ id: z.url() }),
  'gx:headquarterAddress': z.object({}),
  'gx:legalAddress': z.object({
    'gx:countrySubdivisionCode': z.string(),
    'gx:addressCountryCode': z.string().optional(),
    'gx:streetAddress': z.string(),
    'gx:postalCode': z.string(),
    'gx:locality': z.string()
  })
})

const GaiaXCredentialSubjectLegalRegistrationNumberSchema = z.object({
  '@context': z.url(),
  type: z.literal('gx:legalRegistrationNumber'),
  id: z.url(),
  'gx:vatID': z.string(),
  'gx:vatID-countryCode': z.string()
})

const GaiaXCredentialSubjectTermsAndConditionsSchema = z.object({
  type: z.literal('gx:GaiaXTermsAndConditions'),
  'gx:termsAndConditions': z.string(),
  id: z.url()
})

const GaiaXCredentialSubjectDiscriminatedUnionSchema = z.discriminatedUnion(
  'type',
  [
    GaiaXCredentialSubjectLegalParticipantSchema,
    GaiaXCredentialSubjectLegalRegistrationNumberSchema,
    GaiaXCredentialSubjectTermsAndConditionsSchema
  ]
)

// export const GaiaXVerifiableCredentialSchema = z.object({
//   '@context': z.url().array(),
//   type: z
//     .literal('VerifiableCredential')
//     .array()
//     .or(z.literal('VerifiableCredential')),
//   id: z.url(),
//   issuer: z.string(),
//   issuanceDate: z.iso.datetime(),
//   credentialSubject: GaiaXCredentialSubjectDiscriminatedUnionSchema,
//   proof: z.object({
//     type: z.string(),
//     created: z.iso.datetime({ offset: true }),
//     proofPurpose: z.string(),
//     verificationMethod: z.string(),
//     '@context': z.url().array().optional(),
//     jws: z.string()
//   }),
//   evidence: z
//     .object({
//       'gx:evidenceURL': z.url(),
//       'gx:executionDate': z.iso.datetime(),
//       'gx:evidenceOf': z.string()
//     })
//     .array()
//     .optional()
// })

export const GaiaXVerifiableCredentialSchema = z.any()

export const GaiaXVerifiablePresentationSchema = z.object({
  '@context': z.url(),
  type: z.literal('VerifiablePresentation'),
  verifiableCredential: GaiaXVerifiableCredentialSchema.array()
})

export const GaiaXVerifiablePresentationArraySchema =
  GaiaXVerifiablePresentationSchema.array()
