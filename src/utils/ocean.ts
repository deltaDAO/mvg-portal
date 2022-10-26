import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'
import { chains } from '../../chains.config'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  // ETH mainnet config is needed to initialize the urql client
  if (network === 1) {
    return new ConfigHelper().getConfig(
      network,
      process.env.GATSBY_INFURA_PROJECT_ID
    ) as ConfigHelperConfig
  }

  const filterBy = typeof network === 'string' ? 'network' : 'chainId'
  const config = chains.find((c) => c[filterBy] === network)

  if (!config) {
    Logger.error(`No config found for given network '${network}'`)
    return null
  }
  return config
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
