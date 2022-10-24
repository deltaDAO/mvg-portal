// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8
// networkId is required, since its used to look for overwrites
// all other fields are first loaded from ocean.js and are optional
const GX_NETWORK_ID = 2021000

const chains = [
  {
    name: 'Gaia-X',
    networkId: GX_NETWORK_ID,
    nodeUri: 'https://rpc.gaiaxtestnet.oceanprotocol.com/',
    providerUri: 'https://provider.gaiax.delta-dao.com/',
    metadataCacheUri: 'https://aquarius.delta-dao.com/',
    explorerUri: 'https://blockscout.gaiaxtestnet.oceanprotocol.com/',
    isDefault: true
  },
  {
    name: 'GEN-X',
    network: 'testnet',
    networkId: 100,
    nodeUri: 'http://194.182.169.98:8545/',
    providerUri: 'https://provider.genx.delta-dao.com',
    metadataCacheUri: 'https://aquarius.delta-dao.com/',
    explorerUri: 'http://89.145.161.253:4000/',
    isDefault: true,
    factoryAddress: '0x8f0483125FCb9aaAEFA9209D8E9d7b9C8B9Fb90F',
    fixedRateExchangeAddress: '0x30753E4A8aad7F8597332E813735Def5dD395028',
    metadataContractAddress: '0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6'
  }
]

const getDefaultChainIds = () => {
  return chains.filter((chain) => chain.isDefault).map((c) => c.networkId)
}

const getSupportedChainIds = () => {
  return chains.map((c) => c.networkId)
}

module.exports = {
  chains,
  getDefaultChainIds,
  getSupportedChainIds,
  GX_NETWORK_ID
}
