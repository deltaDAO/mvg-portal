export const credentialFieldOptions: Record<string, string[]> = {
  VerifiableId: ['id', 'type'],
  UniversityDegree: ['id', 'type'],
  LegalPerson: [
    'id',
    'type',
    'gx:legalName',
    'gx:legalRegistrationNumber.id',
    'gx:headquarterAddress.gx:countrySubdivisionCode',
    'gx:headquarterAddress.gx:streetAddress'
  ],
  LegalRegistrationNumber: [
    'id',
    'type',
    'gx:leiCode',
    'gx:leiCode-countryCode',
    'gx:leiCode-legalName',
    'gx:leiCode-legalAddress.gx:countrySubdivisionCode',
    'gx:leiCode-legalAddress.gx:streetAddress',
    'gx:leiCode-legalAddress.gx:postalCode',
    'gx:leiCode-legalAddress.gx:locality'
  ],
  GaiaXTermsAndConditions: ['gx:termsAndConditions', 'type', 'id'],
  DataspaceParticipantCredential: [
    'id',
    'type',
    'dataspaceId',
    'legalName',
    'website',
    'legalAddress.countryCode',
    'legalAddress.streetAddress',
    'legalAddress.postcalCode',
    'legalAddress.locality'
  ]
}
