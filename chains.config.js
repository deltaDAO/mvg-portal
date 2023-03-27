// chain configs in ocean.js ConfigHelperConfig format
// see: https://github.com/oceanprotocol/ocean.js/blob/e07a7cb6ecea12b39ed96f994b4abe37806799a1/src/utils/ConfigHelper.ts#L8

const GEN_X_NETWORK_ID = 100

const chains = [
  {
    chainId: 100,
    network: 'genx',
    isDefault: true,
    metadataCacheUri: process.env.NEXT_PUBLIC_GENX_METADATA_CACHE_URI,
    nodeUri: process.env.NEXT_PUBLIC_GENX_NODE_URI,
    providerUri: process.env.NEXT_PUBLIC_GENX_PROVIDER_URI,
    subgraphUri: process.env.NEXT_PUBLIC_GENX_SUBGRAPH_URI,
    explorerUri: process.env.NEXT_PUBLIC_GENX_EXPLORER_URI,
    oceanTokenAddress: process.env.NEXT_PUBLIC_GENX_OCEAN_TOKEN_ADDRESS,
    oceanTokenSymbol: process.env.NEXT_PUBLIC_GENX_OCEAN_TOKEN_SYMBOL,
    fixedRateExchangeAddress:
      process.env.NEXT_PUBLIC_GENX_FIXED_RATE_EXCHANGE_ADDRESS,
    dispenserAddress: process.env.NEXT_PUBLIC_GENX_DISPENSER_ADDRESS,
    startBlock: Number(process.env.NEXT_PUBLIC_GENX_START_BLOCK),
    transactionBlockTimeout: Number(
      process.env.NEXT_PUBLIC_GENX_TRANSACTION_BLOCK_TIMEOUT
    ),
    transactionConfirmationBlocks: Number(
      process.env.NEXT_PUBLIC_GENX_TRANSACTION_CONFIRMATION_BLOCK
    ),
    transactionPollingTimeout: Number(
      process.env.NEXT_PUBLIC_GENX_TRANSACTION_POLLING_TIMEOUT
    ),
    gasFeeMultiplier: Number(process.env.NEXT_PUBLIC_GENX_GAS_FEE_MULTIPLIER),
    nftFactoryAddress: process.env.NEXT_PUBLIC_GENX_NFT_FACTORY_ADDRESS,
    opfCommunityFeeCollector:
      process.env.NEXT_PUBLIC_GENX_COMMUNITY_FEE_COLLECTOR,
    providerAddress: process.env.NEXT_PUBLIC_GENX_PROVIDER_ADDRESS
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
