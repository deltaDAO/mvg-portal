// networks metadata to add to EVM-based Chains list
// see: https://github.com/ethereum-lists/chains

const { GEN_X_NETWORK_ID } = require('./chains.config')

const networksMetadata = [
  {
    name: 'GEN-X Testnet',
    chain: 'GEN-X',
    network: 'testnet',
    rpc: ['https://rpc.genx.minimal-gaia-x.eu'],
    faucets: [],
    nativeCurrency: {
      name: 'GEN-X',
      symbol: 'GX',
      decimals: 18
    },
    infoURL: '',
    shortName: 'GEN-X',
    chainId: GEN_X_NETWORK_ID,
    networkId: GEN_X_NETWORK_ID
  }
]

module.exports = {
  networksMetadata
}
