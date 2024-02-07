// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const chains = [
  {
    chainId: 100,
    isDefault: true,
    isCustom: true,
    network: 'genx',
    metadataCacheUri: 'https://aquarius510.v4.delta-dao.com',
    nodeUri: 'https://rpc.genx.minimal-gaia-x.eu',
    providerUri: 'https://provider.v4.genx.delta-dao.com',
    subgraphUri: 'https://subgraph.v4.genx.minimal-gaia-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu',
    oceanTokenAddress: '0x0995527d3473b3a98c471f1ed8787acd77fbf009',
    oceanTokenSymbol: 'OCEAN',
    fixedRateExchangeAddress: '0xAD8E7d2aFf5F5ae7c2645a52110851914eE6664b',
    dispenserAddress: '0x94cb8FC8719Ed09bE3D9c696d2037EA95ef68d3e',
    startBlock: 3665369,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    nftFactoryAddress: '0x6cb85858183B82154921f68b434299EC4281da53',
    opfCommunityFeeCollector: '0x2e0C9e15A45c9884F7768BB852E7399B9153525d',
    veAllocate: '0x3fa1d5AC45ab1Ff9CFAe227c5583Ec0484b54Ef9',
    veOCEAN: '0x061955B6980A34fce74b235f90DBe20d76f087b1',
    veDelegation: '0x96E3aE4247a01C3d40a261df1F8ead70E32E7C0c',
    veFeeDistributor: '0x35F1e6765750E874EB9d0675393A1A394A4749b4',
    veDelegationProxy: '0x51B1b14b8bfb43a2fB0b49843787Ca440200F6b7',
    DFRewards: '0x4259c164eedA7483dda2b4b622D761A88674D31f',
    DFStrategyV1: '0x1be9C72500B41c286C797D4FE727747Ae9C4E195',
    veFeeEstimate: '0xCFeF55c6ae4d250586e293f29832967a04A9087d',
    providerAddress: '0x68C24FA5b2319C81b34f248d1f928601D2E5246B'
  },
  {
    chainId: 32456,
    isDefault: false,
    isCustom: true,
    network: 'pontusx',
    metadataCacheUri: 'https://aquarius.dev.pontus-x.eu',
    nodeUri: 'https://rpc.dev.pontus-x.eu',
    providerUri: 'https://provider.dev.pontus-x.eu',
    subgraphUri: 'https://subgraph.dev.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu',
    oceanTokenAddress: '0xdF171F74a8d3f4e2A789A566Dce9Fa4945196112',
    oceanTokenSymbol: 'OCEAN',
    fixedRateExchangeAddress: '0x8372715D834d286c9aECE1AcD51Da5755B32D505',
    dispenserAddress: '0x5461b629E01f72E0A468931A36e039Eea394f9eA',
    startBlock: 57428,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    nftFactoryAddress: '0xFdC4a5DEaCDfc6D82F66e894539461a269900E13',
    opfCommunityFeeCollector: '0x1f84fB438292269219f9396D57431eA9257C23d4',
    veAllocate: '0x3fa1d5AC45ab1Ff9CFAe227c5583Ec0484b54Ef9',
    veOCEAN: '0x061955B6980A34fce74b235f90DBe20d76f087b1',
    veDelegation: '0x96E3aE4247a01C3d40a261df1F8ead70E32E7C0c',
    veFeeDistributor: '0x35F1e6765750E874EB9d0675393A1A394A4749b4',
    veDelegationProxy: '0x51B1b14b8bfb43a2fB0b49843787Ca440200F6b7',
    DFRewards: '0x6BB265D6c08b7E7432dF9B3D3499beEAA9856232',
    DFStrategyV1: '0x98FBBB6523441b960E4D1d9A98601332092F4aB6',
    veFeeEstimate: '0xCFeF55c6ae4d250586e293f29832967a04A9087d',
    providerAddress: '0x68C24FA5b2319C81b34f248d1f928601D2E5246B'
  },
  {
    chainId: 80001,
    isDefault: false,
    metadataCacheUri: 'https://aquarius510.v4.delta-dao.com',
    providerUri: 'https://provider.dev-v4.mumbai.delta-dao.com'
  }
]

const getDefaultChainIds = () => {
  return chains.filter((chain) => chain.isDefault).map((c) => c.chainId)
}

const getSupportedChainIds = () => {
  return chains.map((c) => c.chainId)
}

const getCustomChainIds = () => {
  return chains.filter((c) => c.isCustom).map((c) => c.chainId)
}

module.exports = {
  chains,
  getDefaultChainIds,
  getSupportedChainIds,
  getCustomChainIds
}
