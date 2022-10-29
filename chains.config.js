// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const GX_NETWORK_ID = 2021000
const GEN_X_NETWORK_ID = 100

const chains = [
  {
    chainId: GX_NETWORK_ID,
    dispenserAddress: '0x4E6058dC00e90C0DCA47A5d0D3346F409939A5ab',
    explorerUri: 'https://blockscout.gaiaxtestnet.oceanprotocol.com/',
    factoryAddress: '0x2720d405ef7cDC8a2E2e5AeBC8883C99611d893C',
    fixedRateExchangeAddress: '0x3c21a90599b5B7f37014cA5Bf30d3f1b73d7e391',
    gasFeeMultiplier: 1,
    isDefault: false,
    metadataCacheUri: 'https://aquarius.delta-dao.com/',
    metadataContractAddress: '0xCfDdA22C9837aE76E0faA845354f33C62E03653a',
    name: 'Gaia-X',
    network: 'gaiaxtestnet',
    networkId: GX_NETWORK_ID,
    nodeUri: 'https://rpc.gaiaxtestnet.oceanprotocol.com/',
    oceanTokenAddress: '0x80E63f73cAc60c1662f27D2DFd2EA834acddBaa8',
    oceanTokenSymbol: 'OCEAN',
    poolFactoryAddress: '0xc37F8341Ac6e4a94538302bCd4d49Cf0852D30C0',
    providerUri: 'https://provider.gaiax.delta-dao.com/',
    startBlock: 177644,
    subgraphUri: 'https://subgraph.gaiaxtestnet.oceanprotocol.com',
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750
  },
  {
    chainId: GEN_X_NETWORK_ID,
    dispenserAddress: '0xAa588d3737B611baFD7bD713445b314BD453a5C8',
    explorerUri: 'https://explorer.genx.minimal-gaia-x.eu/',
    factoryAddress: '0x8f0483125FCb9aaAEFA9209D8E9d7b9C8B9Fb90F',
    fixedRateExchangeAddress: '0x30753E4A8aad7F8597332E813735Def5dD395028',
    gasFeeMultiplier: 1,
    isDefault: true,
    metadataCacheUri: 'https://aquarius.delta-dao.com/',
    metadataContractAddress: '0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6',
    name: 'GEN-X',
    network: 'genxtestnet',
    networkId: GEN_X_NETWORK_ID,
    nodeUri: 'http://194.182.169.98:8545/',
    oceanTokenAddress: '0xa240c4d34b12dA624eCFE2e2adc88a18db93b02e',
    oceanTokenSymbol: 'OCEAN',
    providerUri: 'https://provider.genx.delta-dao.com',
    startBlock: 1099,
    subgraphUri: 'https://subgraph.genx.minimal-gaia-x.eu',
    transactionBlockTimeout: 100,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 60000,
    BFactory: '0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4'
  }
]

const getDefaultChainIds = () => {
  return chains.filter((chain) => chain.isDefault).map((c) => c.chainId)
}

const getSupportedChainIds = () => {
  return chains.map((c) => c.chainId)
}

module.exports = {
  chains,
  getDefaultChainIds,
  getSupportedChainIds,
  GX_NETWORK_ID,
  GEN_X_NETWORK_ID
}
