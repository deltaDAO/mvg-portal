// networks metadata to add to EVM-based Chains list
// see: https://github.com/ethereum-lists/chains

const networksMetadata = [
  {
    chainId: 100,
    networkId: 100,
    name: 'GEN-X Testnet',
    chain: 'GEN-X',
    rpc: ['https://rpc.genx.minimal-gaia-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'GX',
      symbol: 'GX',
      decimals: 18
    },
    infoURL: 'https://docs.genx.minimal-gaia-x.eu',
    shortName: 'GEN-X',
    explorers: [
      {
        name: 'GEN-X Testnet Explorer',
        url: 'https://explorer.pontus-x.eu',
        standard: ''
      }
    ]
  },
  {
    chainId: 32456,
    networkId: 32456,
    name: 'Pontus-X Testnet',
    chain: 'Pontus-X',
    rpc: ['https://rpc.dev.pontus-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'EUROe',
      symbol: 'EUROe',
      decimals: 18
    },
    infoURL: 'https://docs.pontus-x.eu',
    shortName: 'Pontus-X',
    explorers: [
      {
        name: 'Pontus-X Testnet Explorer',
        url: 'https://explorer.pontus-x.eu',
        standard: ''
      }
    ]
  }
]

module.exports = {
  networksMetadata
}
