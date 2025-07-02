import { ConfigHelper, Config } from '@oceanprotocol/lib'

/**
  This function takes a Config object as an input and returns a new sanitized Config object
  The new Config object has the same properties as the input object, but with some values replaced by environment variables if they exist
  Also adds missing contract addresses deployed when running barge locally
  @param {Config} config - The input Config object
  @returns {Config} A new Config object
*/
export function sanitizeDevelopmentConfig(config: Config): Config {
  return {
    ...config,
    subgraphUri: process.env.NEXT_PUBLIC_SUBGRAPH_URI || config.subgraphUri,
    metadataCacheUri:
      process.env.NEXT_PUBLIC_METADATACACHE_URI || config.metadataCacheUri,
    providerUri: process.env.NEXT_PUBLIC_PROVIDER_URL || config.providerUri,
    nodeUri: process.env.NEXT_PUBLIC_NODE_URI || config.nodeUri,
    fixedRateExchangeAddress:
      process.env.NEXT_PUBLIC_FIXED_RATE_EXCHANGE_ADDRESS ||
      config.fixedRateExchangeAddress,
    dispenserAddress:
      process.env.NEXT_PUBLIC_DISPENSER_ADDRESS || config.dispenserAddress,
    oceanTokenAddress:
      process.env.NEXT_PUBLIC_OCEAN_TOKEN_ADDRESS || config.oceanTokenAddress,
    nftFactoryAddress:
      process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS || config.nftFactoryAddress,
    routerFactoryAddress:
      process.env.NEXT_PUBLIC_ROUTER_FACTORY_ADDRESS ||
      config.routerFactoryAddress,
    accessListFactory:
      process.env.NEXT_PUBLIC_ACCESS_LIST_FACTORY_ADDRESS ||
      config.accessListFactory
  }
}

export function getOceanConfig(network: string | number): Config {
  let config = new ConfigHelper().getConfig(
    network,
    network === 'polygon' ||
      network === 'moonbeamalpha' ||
      network === 1287 ||
      network === 'bsc' ||
      network === 56 ||
      network === 8996
      ? undefined
      : process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
  ) as Config
  if (network === 8996) {
    config = { ...config, ...sanitizeDevelopmentConfig(config) }
  }

  // Override RPC URL for Sepolia if it's set (the reason is ocean.js supports only infura)
  if (network === 11155111 && process.env.NEXT_PUBLIC_NODE_URI) {
    config.nodeUri = process.env.NEXT_PUBLIC_NODE_URI
  }

  return config as Config
}

export function getDevelopmentConfig(): Config {
  return {
    // factoryAddress: contractAddresses.development?.DTFactory,
    // poolFactoryAddress: contractAddresses.development?.BFactory,
    // fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    // metadataContractAddress: contractAddresses.development?.Metadata,
    // oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Sepolia one for now
    subgraphUri: 'https://v4.subgraph.sepolia.oceanprotocol.com'
  } as Config
}
