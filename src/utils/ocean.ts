import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'
import { chains } from '../../chains.config'
import { ConfigHelperConfigOverwrite } from '../@types/Chains'
import { metadataCacheUri } from '../../app.config'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  const config = new ConfigHelper().getConfig(
    network,
    network === 'moonbeamalpha' ||
      network === 1287 ||
      network === 'bsc' ||
      network === 56 ||
      network === 'gaiaxtestnet' ||
      network === 2021000 ||
      network === 'catenaxtestnet' ||
      network === 2021001
      ? undefined
      : process.env.GATSBY_INFURA_PROJECT_ID
  ) as ConfigHelperConfig

  const configOverwrite = (chains as ConfigHelperConfigOverwrite[]).find(
    (c) => c.networkId === config.networkId
  )

  config.metadataCacheUri = metadataCacheUri

  return configOverwrite
    ? {
        ...config,
        ...configOverwrite
      }
    : config
}

export function getDevelopmentConfig(): Partial<ConfigHelperConfig> {
  return {
    factoryAddress: contractAddresses.development?.DTFactory,
    poolFactoryAddress: contractAddresses.development?.BFactory,
    fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    metadataContractAddress: contractAddresses.development?.Metadata,
    oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Rinkeby one for now
    subgraphUri: 'https://subgraph.gaiaxtestnet.oceanprotocol.com'
  }
}

export async function getOceanBalance(
  accountId: string,
  networkId: number,
  web3: Web3
): Promise<string> {
  const minABI = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ] as AbiItem[]

  try {
    const token = new web3.eth.Contract(
      minABI,
      getOceanConfig(networkId).oceanTokenAddress,
      { from: accountId }
    )
    const result = web3.utils.fromWei(
      await token.methods.balanceOf(accountId).call()
    )
    return result
  } catch (e) {
    Logger.error(`ERROR: Failed to get the balance: ${e.message}`)
  }
}
