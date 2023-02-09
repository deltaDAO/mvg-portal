import { ConfigHelper, Config, configHelperNetworks } from '@oceanprotocol/lib'

// import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'

const v4Contracts = {
  Ocean: '0xE945Bc2097d96B3FfB8e48bBb71ef7D3968f8597',
  OPFCommunityFeeCollector: '0x2e0C9e15A45c9884F7768BB852E7399B9153525d',
  startBlock: 1247152,
  Router: '0xc9f83F595C763e43Ddea97426E4030D03c9FFD70',
  FixedPrice: '0xFde80d4228B7dEf216E24f84e9BAc8458C5F232c',
  Staking: '0xE5517D71C61537e7693630f60Bd9E09f1215479a',
  ERC20Template: {
    1: '0x0301E8676e8bCa960dc95b8bd93D6AAf0B2F1020',
    2: '0xB3a2c32925b730348bb5177b1F8fBD1Ac90eBe63'
  },
  ERC721Template: {
    1: '0x9F13dE57BCf7462E6124b99C62a9F2CBc7860600'
  },
  Dispenser: '0x44cf54BA87fcE6882dF59ECe877a71ceaD5045a7',
  ERC721Factory: '0x16575f77c27A3437FE1bE56AB983f1bEb0DD14B2'
}
configHelperNetworks.push({
  ...new ConfigHelper().getConfig(80001), // mumbai config as baseline
  nodeUri: 'https://rpc.genx.minimal-gaia-x.eu',
  chainId: 100,
  network: 'genx',
  dispenserAddress: v4Contracts.Dispenser,
  subgraphUri: 'https://subgraph.genx.minimal-gaia-x.eu',
  explorerUri: 'https://logging.genx.minimal-gaia-x.eu',
  metadataCacheUri: 'https://aquarius.v4.genx.delta-dao.com',
  providerUri: 'https://provider.v4.genx.delta-dao.com',
  oceanTokenAddress: v4Contracts.Ocean,
  fixedRateExchangeAddress: v4Contracts.FixedPrice,
  startBlock: v4Contracts.startBlock,
  nftFactoryAddress: v4Contracts.ERC721Factory,
  providerAddress: '0x68C24FA5b2319C81b34f248d1f928601D2E5246B'
})

export function getOceanConfig(network: string | number): Config {
  const config = new ConfigHelper().getConfig(
    network,
    network === 'polygon' ||
      network === 'moonbeamalpha' ||
      network === 1287 ||
      network === 'bsc' ||
      network === 56 ||
      network === 'gaiaxtestnet' ||
      network === 2021000 ||
      network === 'genx' ||
      network === 100
      ? undefined
      : process.env.NEXT_PUBLIC_INFURA_PROJECT_ID
  ) as Config
  return config as Config
}

export function getDevelopmentConfig(): Config {
  return {
    // factoryAddress: contractAddresses.development?.DTFactory,
    // poolFactoryAddress: contractAddresses.development?.BFactory,
    // fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    // metadataContractAddress: contractAddresses.development?.Metadata,
    // oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Goerli one for now
    subgraphUri: 'https://v4.subgraph.goerli.oceanprotocol.com'
  } as Config
}
