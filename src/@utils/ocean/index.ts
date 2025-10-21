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
    nodeUri: config.nodeUri,
    oceanNodeUri: process.env.NEXT_PUBLIC_PROVIDER_URL || config.oceanNodeUri,
    fixedRateExchangeAddress:
      process.env.NEXT_PUBLIC_FIXED_RATE_EXCHANGE_ADDRESS,
    dispenserAddress: process.env.NEXT_PUBLIC_DISPENSER_ADDRESS,
    oceanTokenAddress: config.oceanTokenAddress,
    nftFactoryAddress: process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS,
    routerFactoryAddress: process.env.NEXT_PUBLIC_ROUTER_FACTORY_ADDRESS,
    accessListFactory:
      config.accessListFactory ||
      process.env.NEXT_PUBLIC_ACCESS_LIST_FACTORY_ADDRESS
  } as Config
}

export function getOceanConfig(network: string | number): Config {
  // Load the RPC map from .env
  const rpcMap: Record<string, string> = process.env.NEXT_PUBLIC_NODE_URI_MAP
    ? JSON.parse(process.env.NEXT_PUBLIC_NODE_URI_MAP)
    : {}

  if (!network) {
    console.warn('[getOceanConfig] No network provided yet.')
    return {} as Config
  }

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

  // Override nodeUri with value from RPC map if it exists
  const networkKey = network.toString()
  if (rpcMap[networkKey]) {
    config.nodeUri = rpcMap[networkKey]
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
    nodeUri: 'https://v4.subgraph.sepolia.oceanprotocol.com'
  } as Config
}
