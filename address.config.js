const PONTUSX_ADDRESSES = require('./pontusxAddresses.json')

module.exports = {
  whitelists: {
    'nft.owner': [],
    'datatokens.address': []
  },
  featured: [
    {
      title:
        'Monitoring and certifying environmental sustainability in pig farming',
      assets: [
        // NetPig - Environmental Sustainability Report Generator
        'did:op:f0f0e7de07529aac4907a619c53dc6884ccb01cadd2666174216cd1a3f94f426',
        // CEP - Environment and Comfort - 2021 S1
        'did:op:75afadb65591ca977344fa598c2b42c0ca5c7e8620b7c8bf47533e8f222d7997'
      ]
    },
    {
      title: 'Soil tests data integration and sharing using Generative AI',
      assets: [
        // GenAI Soil Analysis PDF Report Data Extractor
        'did:op:d1349e0239c432b1fb598abc082b9484859ba04618f4b28a34c16fc3e3012685',
        // Soil test report in PDF format
        'did:op:ee7047510645b71055f092572073eb7ad34895a698cf737b9bf8af8fea84ef58'
      ]
    },
    {
      title: 'Computer Vision for animal well-being in the pig sector',
      assets: [
        // Mask R-CNN segmentation & Tracking
        'did:op:60d977086cc8e499b996c3a50e1f2f57c023e25b77db58b394beb70b10fdfd21',
        // CEP Pigs Images
        'did:op:42bac83af0e801f25ccaa3cffe8db3afa1bff9a94be9c12388b95feb641dc5a6'
      ]
    },
    {
      title:
        'Precision livestock farming data sharing, integration and exploitation',
      assets: [
        // CEP's CSV Data Mapper and Semantic Data Pooler
        'did:op:ffa62c4e6306d24c68d3a0f0825804045abb91f27a12f5452403cf6b804ca519',
        // CEP Pigs Feeding Data
        'did:op:c898901a7133b6ec92e871d9d692073d18effb0f4d5fe955d3f8f0a7b9f8b962',
        // Exploratory Data Analysis
        'did:op:80d669824854177e42fe4e23f42ba5f7e9823d8ac6f9f224fec157e25d5f04da'
      ]
    }
  ],
  verifiedAddresses: PONTUSX_ADDRESSES
}
