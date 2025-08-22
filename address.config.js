const PONTUSX_ADDRESSES = require('./pontusxAddresses.json')

module.exports = {
  whitelists: {
    'nft.owner': [],
    'datatokens.address': []
  },
  featured: [
    {
      title: 'Smart Mobility, Automotive',
      assets: [
        'did:op:f892fdeb6e4aead439a992ee66322d96d625f7acfed999e633c4b5c81b0968a9', // Hamburg Urban Data
        'did:op:60345a1cffaf69e978846858760f69ebe6688e3fa1b9a21f2cdb81b82c415049', // Road Condition Short
        'did:op:4103da1b9000f90c4262b94353b23175e490f47e3fd9bf3bda440f550178f423', // Road Condition Long
        'did:op:423ae6f53c14980e871ba8109f1f493077c1691dac7a56c413a973238a90f2fa', // Hamburg Road 18
        'did:op:61788149bc0837d0bea0ee32b04eb8bebb20c2e73e1098cfdec4807d86eddac7', // Hamburg Road 17
        'did:op:1cccfa6b2de76b2f831183c9404675a84f12c336c2ebde87dbfad9e2b39c1295', // SH Road 16
        'did:op:f6b81477c783e84cb9fbb0d7b57b1974b6f0a86067f2f17bbdd9f2e2dd7802a3', // SH Road 15
        'did:op:555b7d7c03f365c9166afb4524fe5e332f9794fbeb5e9770fe47d1da9adff9c4', // SH Road 14
        'did:op:aea8d72bd0ea2f2633599caa69488b212ecaa7fb0b44abb0e3c58494da143b95', // SH Road 13
        'did:op:1501d13f41eca77a6a5449a1ecf5d8ff5ca4a1881889af5b8912629ab71856e5', // zone
        'did:op:14f5679644249e7889b85d9964abb96eb31eb5537651d3458b9616d29450772c' // ArcGIS
      ]
    },
    {
      title: 'Manufacturing, Industry 4.0',
      assets: [
        'did:op:ec6abd810b3f3d9f3cf7fbbfd3462e289ee9700f0a1ca492adaf6a8c7d0bdce7', // EuPro 882
        'did:op:291ac52240e7c422aa8e67f9369efa7b30cbdc3f494922f1b646a8091a97fdb6', // CO2
        'did:op:c524a2ad8aab175315cdbb106289114079637529af988874c1a31e9a179e4540', // Condition Monitoring
        'did:op:3bee178505bf07494aeaafe67b5d98b5ebd0986bb56d6673e718f8ac4e090c8a', // EuPro 881
        'did:op:daecfe8261713a3854bdb59de6e6eba1e614dae3a40f436f955f2a94559a88ca', // EuPro 880
        'did:op:f203cde14dc2fa67b58156009463cae1b6679b76e6387da8c43951846788d1a8', // Defects Algo
        'did:op:535c60bdf170de37d818f69765f1382dd680b63f245b1a30b897b46ddc753064', // Defects Data
        'did:op:8b6e04b2f06290c75926756f814413c134a4fb701c607824fd7f7877f0292483', // AAS
        'did:op:e75f58835ca5ac41bdd3464a4229108e1f74e81b71bd691ecca37ac33a79a6e8', // AAS
        'did:op:ba056765418629a645d1cea3b6254d1ae8f374fd893edba6c4ddee5f097fefc2', // AAS
        'did:op:ea274c721f8c7d36787401dbe7b0fd83670ee50a83aee9d7f1e49060257aa618', // AAS
        'did:op:77cb936c42ca521393cdb423926c022b0cbb4442aff2b63a9cfecb2c74941843', // AAS
        'did:op:b5c7eb3887469a532a021020365259055084af3d7bd047a8a79a865ee848598e' // AAS
      ]
    },
    {
      title: 'Text Analysis, Language Processing, and more',
      assets: [
        'did:op:73c511711d6ad19794cd3797149e3a9fbd6d615246ae2be8d56938985b715ed4', // Cross Asia Text
        'did:op:fca47f74bd99d3a3c523bc3242497df4a098ceb028940428db18200c26e74995', // Cross Asia Algo
        'did:op:ee381eb15d25d27b663565984601699473afeba4ba2efa43d9b6f9c88827f625', // XAsia Prob Data
        'did:op:a63864d02fbda42fa945eb071093bfd69e2b9de2e083382028c531d468996875' // XAsia Prob Algo
      ]
    },
    {
      title: 'Finance, Business Analytics, and more',
      assets: [
        'did:op:ab4b4a4953b8fddb69c5a68ce12c10727a002cc160fb9d0dd37aadbfb8de95af' // PMO
      ]
    }
  ],
  verifiedAddresses: PONTUSX_ADDRESSES
}
