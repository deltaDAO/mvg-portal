const {
  FilterByTypeOptions,
  FilterByAccessOptions,
  FILTER_VALUES
} = require('./src/@types/aquarius/SearchQuery')

module.exports = {
  filters: [
    {
      id: 'serviceType',
      label: 'Service Type',
      type: 'filterList',
      queryPath: 'metadata.type',
      options: [
        { label: 'datasets', value: FilterByTypeOptions.Data },
        { label: 'algorithms', value: FilterByTypeOptions.Algorithm },
        { label: 'saas', value: FilterByTypeOptions.Saas }
      ]
    },
    {
      id: 'accessType',
      label: 'Access Type',
      type: 'filterList',
      queryPath: 'services.type',
      options: [
        { label: 'download', value: FilterByAccessOptions.Download },
        { label: 'compute', value: FilterByAccessOptions.Compute }
      ]
    },
    {
      id: 'gaiax',
      label: 'Gaia-X Service',
      type: 'filterList',
      options: [
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
