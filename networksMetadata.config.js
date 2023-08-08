// networks metadata to add to EVM-based Chains list
// see: https://github.com/ethereum-lists/chains

const { GEN_X_NETWORK_ID } = require('./chains.config')

const networksMetadata = [
  {
    name: 'GEN-X Testnet',
    chain: 'GEN-X',
    rpc: ['https://rpc.genx.minimal-gaia-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'GEN-X Token',
      symbol: 'GX',
      decimals: 18
    },
    infoURL: 'https://docs.genx.minimal-gaia-x.eu',
    shortName: 'GEN-X',
    chainId: GEN_X_NETWORK_ID,
    networkId: GEN_X_NETWORK_ID,
    explorers: [
      {
        name: 'Exchange Logging Service',
        url: 'https://explorer.pontus-x.eu',
        standard: ''
      }
    ]
  }
]

module.exports = {
  networksMetadata
}
