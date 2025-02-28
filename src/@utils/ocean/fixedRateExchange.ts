import { FixedRateExchange, PriceAndFees } from '@oceanprotocol/lib'
import { Signer } from 'ethers'
import { getOceanConfig } from '.'
import { consumeMarketFixedSwapFee } from '../../../app.config.cjs'
import { getDummySigner } from '@utils/wallet'

/**
 * This is used to calculate the price to buy one datatoken from a fixed rate exchange. You need to pass either a web3 object or a chainId. If you pass a chainId a dummy web3 object will be created
 */
export async function getFixedBuyPrice(
  accessDetails: AccessDetails,
  chainId?: number,
  signer?: Signer
): Promise<PriceAndFees> {
  const config = getOceanConfig(chainId)

  if (!signer && !chainId)
    throw new Error("web3 and chainId can't be undefined at the same time!")

  if (!signer) {
    signer = await getDummySigner(chainId)
  }

  const fixed = new FixedRateExchange(config.fixedRateExchangeAddress, signer)
  const estimatedPrice = await fixed.calcBaseInGivenDatatokensOut(
    accessDetails.addressOrId,
    '1',
    consumeMarketFixedSwapFee
  )
  return estimatedPrice
}
