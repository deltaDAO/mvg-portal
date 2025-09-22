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
  ],
  'gx:LegalPerson': [
    'id',
    'schema:name',
    'gx:registrationNumber.id',
    'gx:headquartersAddress.type',
    'gx:headquartersAddress.gx:countryCode',
    'gx:headquartersAddress.vcard:street-address',
    'gx:headquartersAddress.vcard:locality',
    'gx:headquartersAddress.vcard:postal-code',
    'gx:legalAddress.type',
    'gx:legalAddress.gx:countryCode',
    'gx:legalAddress.vcard:street-address',
    'gx:legalAddress.vcard:locality',
    'gx:legalAddress.vcard:postal-code'
  ],
  'gx:Issuer': ['id', 'gaiaxTermsAndConditions'],
  'gx:EORI': ['id', 'type', 'gx:eori'],
  'gx:LeiCode': [
    '@context.schema',
    'id',
    'type',
    'schema:leiCode',
    'gx:countryCode',
    'gx:subdivisionCountryCode'
  ],
  'gx:VatID': ['id', 'type', 'gx:vatID', 'gx:countryCode']
}
