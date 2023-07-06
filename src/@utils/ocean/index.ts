import { ConfigHelper, Config } from '@oceanprotocol/lib'
import { chains } from '../../../chains.config'
import { ethers } from 'ethers'

import abiDatatoken from '@oceanprotocol/contracts/artifacts/contracts/templates/ERC20TemplateEnterprise.sol/ERC20TemplateEnterprise.json'

export function getOceanConfig(network: string | number): Config {
  const filterBy = typeof network === 'string' ? 'network' : 'chainId'
  const customConfig = chains.find((c) => c[filterBy] === network)

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

  return customConfig
    ? ({ ...config, ...customConfig } as Config)
    : (config as Config)
}

/**
 * getPaymentCollector - returns the current paymentCollector
 * @param dtAddress datatoken address
 * @param provider the ethers.js web3 provider
 * @return {Promise<string>}
 */
export async function getPaymentCollector(
  dtAddress: string,
  provider: ethers.providers.Provider
): Promise<string> {
  const dtContract = new ethers.Contract(dtAddress, abiDatatoken.abi, provider)
  const paymentCollector = await dtContract.getPaymentCollector()
  return paymentCollector
}
