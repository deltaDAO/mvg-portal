import {
  AssetPrice,
  getErrorMessage,
  LoggerInstance,
  ProviderFees,
  ProviderInstance,
  Service,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import { getFixedBuyPrice } from './ocean/fixedRateExchange'
import Decimal from 'decimal.js'
import {
  consumeMarketOrderFee,
  publisherMarketOrderFee,
  customProviderUrl
} from '../../app.config'
import { Signer } from 'ethers'
import { toast } from 'react-toastify'

/**
 * This will be used to get price including fees before ordering
 * @param {AssetExtended} asset
 * @return {Promise<OrdePriceAndFee>}
 */
export async function getOrderPriceAndFees(
  asset: AssetExtended,
  service: Service,
  accessDetails: AccessDetails,
  accountId: string,
  signer?: Signer,
  providerFees?: ProviderFees
): Promise<OrderPriceAndFees> {
  const orderPriceAndFee = {
    price: accessDetails.price || '0',
    publisherMarketOrderFee: publisherMarketOrderFee || '0',
    publisherMarketFixedSwapFee: '0',
    consumeMarketOrderFee: consumeMarketOrderFee || '0',
    consumeMarketFixedSwapFee: '0',
    providerFee: {
      providerFeeAmount: '0'
    },
    opcFee: '0'
  } as OrderPriceAndFees
  // fetch provider fee
  let initializeData
  try {
    initializeData =
      !providerFees &&
      (await ProviderInstance.initialize(
        asset.id,
        service.id,
        0,
        accountId,
        customProviderUrl || service.serviceEndpoint
      ))
  } catch (error) {
    const message = getErrorMessage(error.message)
    LoggerInstance.error('[Initialize Provider] Error:', message)

    // Customize error message for accountId non included in allow list
    if (
      // TODO: verify if the error code is correctly resolved by the provider
      message.includes(
        'ConsumableCodes.CREDENTIAL_NOT_IN_ALLOW_LIST' || 'denied with code: 3'
      )
    ) {
      accountId !== ZERO_ADDRESS &&
        toast.error(
          `Consumer address not found in allow list for service ${asset.id}. Access has been denied.`
        )
      return
    }
    // Customize error message for accountId included in deny list
    if (
      message.includes(
        // TODO: verify if the error code is correctly resolved by the provider
        'ConsumableCodes.CREDENTIAL_IN_DENY_LIST' || 'denied with code: 4'
      )
    ) {
      accountId !== ZERO_ADDRESS &&
        toast.error(
          `Consumer address found in deny list for service ${asset.id}. Access has been denied.`
        )
      return
    }

    toast.error(message)
  }
  orderPriceAndFee.providerFee = providerFees || initializeData.providerFee

  // fetch price and swap fees
  if (accessDetails.type === 'fixed') {
    const fixed = await getFixedBuyPrice(accessDetails, asset.chainId, signer)
    orderPriceAndFee.price = fixed.baseTokenAmount
    orderPriceAndFee.opcFee = fixed.oceanFeeAmount
    orderPriceAndFee.publisherMarketFixedSwapFee = fixed.marketFeeAmount
    orderPriceAndFee.consumeMarketFixedSwapFee = fixed.consumeMarketFeeAmount
  }

  // calculate full price, we assume that all the values are in ocean, otherwise this will be incorrect
  orderPriceAndFee.price = new Decimal(+orderPriceAndFee.price || 0)
    .add(new Decimal(+orderPriceAndFee?.consumeMarketOrderFee || 0))
    .add(new Decimal(+orderPriceAndFee?.publisherMarketOrderFee || 0))
    .toString()

  return orderPriceAndFee
}

/**
 * @param {number} chainId
 * @param {string} datatokenAddress
 * @param {number} timeout timout of the service, this is needed to return order details
 * @param {string} account account that wants to buy, is needed to return order details
 * @returns {Promise<AccessDetails>}
 */
export async function getAccessDetails(
  serviceStat: ServiceStat | undefined
): Promise<AccessDetails> {
  const accessDetails: AccessDetails = {
    type: 'NOT_SUPPORTED',
    price: '0',
    templateId: 0,
    addressOrId: '',
    baseToken: {
      address: '',
      name: '',
      symbol: '',
      decimals: 0
    },
    datatoken: {
      address: '',
      name: '',
      symbol: '',
      decimals: 0
    },
    isOwned: false,
    validOrderTx: '',
    isPurchasable: false,
    publisherMarketOrderFee: '0'
  }

  if (serviceStat === undefined || serviceStat.prices.length === 0) {
    return accessDetails
  }

  const tokenPrice = serviceStat.prices[0] // support only 1 price for now

  if (tokenPrice.type === 'dispenser') {
    accessDetails.type = 'free'
    accessDetails.addressOrId = tokenPrice.contract
    accessDetails.price = '0'
  } else if (tokenPrice.type === 'fixedrate') {
    accessDetails.type = 'fixed'
    accessDetails.addressOrId = tokenPrice.exchangeId
    accessDetails.price = tokenPrice.price
    accessDetails.baseToken = {
      address: tokenPrice.token.address,
      name: tokenPrice.token.name,
      symbol: tokenPrice.token.symbol,
      decimals: tokenPrice.token.decimals
    }
  } else {
    // unsupported type
    return accessDetails
  }

  accessDetails.datatoken = {
    address: serviceStat.datatokenAddress,
    name: serviceStat.name,
    symbol: serviceStat.symbol
  }

  // TODO
  accessDetails.templateId = 1
  accessDetails.isPurchasable = true
  accessDetails.isOwned = false
  accessDetails.validOrderTx = '' // should be possible to get from ocean-node - orders collection in typesense
  accessDetails.publisherMarketOrderFee = '0'

  return accessDetails
}

export function getAvailablePrice(accessDetails: AccessDetails): AssetPrice {
  const price: AssetPrice = {
    value: Number(accessDetails.price),
    tokenSymbol: accessDetails.baseToken?.symbol,
    tokenAddress: accessDetails.baseToken?.address
  }

  return price
}
