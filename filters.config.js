const FILTER_VALUES = {
  MUST_EXIST: 'MUST_EXIST',
  MUST_EXISTS_AND_NON_EMPTY: 'MUST_EXISTS_AND_NON_EMPTY'
  //...
}

module.exports = {
  filters: [
    {
      id: 'gaiax',
      label: 'Gaia-X Service',
      type: 'filterList',
      options: [
        // a new filter value for a MUST_EXIST type could be added to handle this new functionality
        {
          label: 'Service SD',
          value: FILTER_VALUES.MUST_EXISTS_AND_NON_EMPTY,
          queryPath:
            'metadata.additionalInformation.gaiaXInformation.serviceSD.url'
        },
        {
          label: 'Terms and Conditions',
          value: FILTER_VALUES.MUST_EXIST,
          queryPath:
            'metadata.additionalInformation.gaiaXInformation.termsAndConditions'
        },
        // options can have their own queryPath defined that gets validated against the defined value
        {
          label: 'Verified',
          value: FILTER_VALUES.MUST_EXIST,
          queryPath:
            'metadata.additionalInformation.gaiaXInformation.serviceSd.isValid'
        }
      ]
    }
  ],
  filterSets: {}
}
