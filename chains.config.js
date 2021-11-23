// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8
// networkId is required, since its used to look for overwrites
// all other fields are first loaded from ocean.js and are optional
const chains = [
  {
    networkId: 3,
    providerUri: 'https://provider.ropsten.delta-dao.com',
    isDefault: true
  },
  {
    networkId: 4,
    providerUri: 'https://provider.rinkeby.delta-dao.com',
    isDefault: true
  },
  {
    networkId: 2021000,
    nodeUri: 'https://rpc.gaiaxtestnet.oceanprotocol.com/',
    providerUri: 'https://provider.gaiax.delta-dao.com/',
    explorerUri: 'https://blockscout.gaiaxtestnet.oceanprotocol.com/',
    isDefault: false
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
  getSupportedChainIds
}
