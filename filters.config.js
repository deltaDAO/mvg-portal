module.exports = {
  filters: [
    {
      id: 'filterSet',
      label: 'Categories',
      type: 'filterList',
      options: [
        {
          label: 'automotive',
          value: 'automotive'
        },
        {
          label: 'manufacturing',
          value: 'manufacturing'
        },
        {
          label: 'text analysis',
          value: 'textAnalysis'
        },
        {
          label: 'finance',
          value: 'finance'
        }
      ]
    }
  ],
  filterSets: {
    automotive: [
      'charging',
      'ev',
      'gx4m',
      'mobility',
      'moveid',
      'parking',
      'traffic'
    ],
    manufacturing: [
      'euprogigant',
      'industry40',
      'manufacturing',
      'predictive-maintenance'
    ],
    textAnalysis: ['library', 'ocr', 'text-analysis'],
    finance: ['graphql']
  }
}
