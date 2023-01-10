// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const GEN_X_NETWORK_ID = 100

const chains = [
  {
    chainId: GEN_X_NETWORK_ID,
    dispenserAddress: '0x2a39940D98A4f9D01Ff0738c8420F360435b6A59',
    explorerUri: 'https://explorer.genx.minimal-gaia-x.eu/',
    factoryAddress: '0x325c09E2093C56AbDc86c5ccD68c77952e8034Af',
    fixedRateExchangeAddress: '0x69Df9594E6A30a5751D170093059E7adb3Bf5e92',
    gasFeeMultiplier: 1,
    isDefault: true,
    metadataCacheUri: 'https://aquarius.delta-dao.com/',
    metadataContractAddress: '0xfA89407778041EF51B9e1aA16Ff85bDf908D17e6',
    name: 'GEN-X',
    network: 'genxtestnet',
    networkId: GEN_X_NETWORK_ID,
    nodeUri: 'https://rpc.genx.minimal-gaia-x.eu',
    oceanTokenAddress: '0x0995527d3473b3A98C471f1ED8787ACD77fBF009',
    oceanTokenSymbol: 'OCEAN',
    providerUri: 'https://provider.genx.delta-dao.com',
    startBlock: 1099,
    subgraphUri: 'https://subgraph.genx.minimal-gaia-x.eu',
    transactionBlockTimeout: 100,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 60000,
    BFactory: '0x7da756d49DFECb750B5ABa51c04088f257c3f8B4'
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
  GEN_X_NETWORK_ID
}
