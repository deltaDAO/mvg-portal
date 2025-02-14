// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const chains = [
  {
    chainId: 32456,
    isDefault: false,
    isCustom: true,
    network: 'pontusx-devnet',
    oceanTokenSymbol: 'OCEAN',
    oceanTokenAddress: '0xdF171F74a8d3f4e2A789A566Dce9Fa4945196112',
    nftFactoryAddress: '0xFdC4a5DEaCDfc6D82F66e894539461a269900E13',
    fixedRateExchangeAddress: '0x8372715D834d286c9aECE1AcD51Da5755B32D505',
    dispenserAddress: '0x5461b629E01f72E0A468931A36e039Eea394f9eA',
    opfCommunityFeeCollector: '0x1f84fB438292269219f9396D57431eA9257C23d4',
    startBlock: 57428,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://provider.dev.pontus-x.eu',
    providerAddress: '0x68C24FA5b2319C81b34f248d1f928601D2E5246B',
    metadataCacheUri: 'https://aquarius.pontus-x.eu',
    nodeUri: 'https://rpc.dev.pontus-x.eu',
    subgraphUri: 'https://subgraph.dev.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu/devnet/pontusx'
  },
  {
    chainId: 32457,
    isDefault: true,
    isCustom: true,
    network: 'pontusx-testnet',
    oceanTokenSymbol: 'OCEAN',
    oceanTokenAddress: '0x5B190F9E2E721f8c811E4d584383E3d57b865C69',
    nftFactoryAddress: '0x2C4d542ff791890D9290Eec89C9348A4891A6Fd2',
    fixedRateExchangeAddress: '0xcE0F39abB6DA2aE4d072DA78FA0A711cBB62764E',
    dispenserAddress: '0xaB5B68F88Bc881CAA427007559E9bbF8818026dE',
    opfCommunityFeeCollector: '0xACC8d1B2a0007951fb4ed622ACB1C4fcCAbe778D',
    startBlock: 82191,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://provider.test.pontus-x.eu',
    providerAddress: '0x9546d39CE3E48BC942f0be4AA9652cBe0Aff3592',
    metadataCacheUri: 'https://aquarius.pontus-x.eu',
    nodeUri: 'https://rpc.test.pontus-x.eu',
    subgraphUri: 'https://subgraph.test.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu/testnet/pontusx'
  },
  {
    chainId: 23294,
    isDefault: true,
    isCustom: true,
    network: 'Sapphire Mainnet',
    oceanTokenSymbol: 'PTX',
    oceanTokenAddress: '0x431aE822B6D59cc96dA181dB632396f58932dA9d',
    nftFactoryAddress: '0x80E63f73cAc60c1662f27D2DFd2EA834acddBaa8',
    fixedRateExchangeAddress: '0xf26c6C93f9f1d725e149d95f8E7B2334a406aD10',
    dispenserAddress: '0x2112Eb973af1DBf83a4f11eda82f7a7527D7Fde5',
    opfCommunityFeeCollector: '0x06100AB868206861a4D7936166A91668c2Ce1312',
    startBlock: 905232,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier: 1.1,
    providerUri: 'https://provider.main.pontus-x.eu',
    providerAddress: '0x9546d39CE3E48BC942f0be4AA9652cBe0Aff3592',
    metadataCacheUri: 'https://aquarius.main.pontus-x.eu',
    nodeUri: 'https://rpc.main.pontus-x.eu/0953a56072a9a7ca46f57498453d2b3d',
    subgraphUri: 'https://subgraph.main.pontus-x.eu',
    explorerUri: 'https://explorer.pontus-x.eu/testnet/pontusx'
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
