// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const GEN_X_NETWORK_ID = 100

const chains = [
  {
    chainId: 100,
    network: 'genx',
    isDefault: true,
    metadataCacheUri:
      process.env.NEXT_PUBLIC_GENX_METADATA_CACHE_URI ||
      'https://aquarius.v4.genx.delta-dao.com',
    nodeUri:
      process.env.NEXT_PUBLIC_GENX_NODE_URI ||
      'https://rpc.genx.minimal-gaia-x.eu',
    providerUri:
      process.env.NEXT_PUBLIC_GENX_PROVIDER_URI ||
      'https://provider.v4.genx.delta-dao.com',
    subgraphUri:
      process.env.NEXT_PUBLIC_GENX_SUBGRAPH_URI ||
      'https://subgraph.v4.genx.minimal-gaia-x.eu',
    explorerUri:
      process.env.NEXT_PUBLIC_GENX_EXPLORER_URI ||
      'https://logging.genx.minimal-gaia-x.eu',
    oceanTokenAddress:
      process.env.NEXT_PUBLIC_GENX_OCEAN_TOKEN_ADDRESS ||
      '0x0995527d3473b3a98c471f1ed8787acd77fbf009',
    oceanTokenSymbol: 'OCEAN',
    fixedRateExchangeAddress:
      process.env.NEXT_PUBLIC_GENX_FIXED_RATE_EXCHANGE_ADDRESS ||
      '0xAD8E7d2aFf5F5ae7c2645a52110851914eE6664b',
    dispenserAddress:
      process.env.NEXT_PUBLIC_GENX_DISPENSER_ADDRESS ||
      '0x94cb8FC8719Ed09bE3D9c696d2037EA95ef68d3e',
    startBlock: Number(process.env.NEXT_PUBLIC_GENX_START_BLOCK) || 3665369,
    transactionBlockTimeout: 50,
    transactionConfirmationBlocks: 1,
    transactionPollingTimeout: 750,
    gasFeeMultiplier:
      Number(process.env.NEXT_PUBLIC_GENX_GAS_FEE_MULTIPLIER) || 1.1,
    nftFactoryAddress:
      process.env.NEXT_PUBLIC_GENX_NFT_FACTORY_ADDRESS ||
      '0x6cb85858183B82154921f68b434299EC4281da53',
    opfCommunityFeeCollector:
      process.env.NEXT_PUBLIC_GENX_COMMUNITY_FEE_COLLECTOR ||
      '0x2e0C9e15A45c9884F7768BB852E7399B9153525d',
    providerAddress:
      process.env.NEXT_PUBLIC_GENX_PROVIDER_ADDRESS ||
      '0x68C24FA5b2319C81b34f248d1f928601D2E5246B'
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
