import {
  approve,
  approveWei,
  Datatoken,
  Dispenser,
  FixedRateExchange,
  FreOrderParams,
  LoggerInstance,
  OrderParams,
  ProviderComputeInitialize,
  ProviderFees,
  ProviderInstance,
  ProviderInitialize,
  getErrorMessage,
  allowance
} from '@oceanprotocol/lib'
import {
  Signer,
  ethers,
  TransactionResponse,
  formatUnits,
  parseUnits,
  BigNumberish
} from 'ethers'
import { getOceanConfig } from './ocean'
import appConfig, {
  marketFeeAddress,
  consumeMarketOrderFee,
  consumeMarketFixedSwapFee,
  customProviderUrl
} from '../../app.config.cjs'
import { toast } from 'react-toastify'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'

export async function initializeProvider(
  asset: AssetExtended,
  service: Service,
  accountId: string,
  providerFees?: ProviderFees
): Promise<ProviderInitialize> {
  if (providerFees) return

  try {
    // SSI-enabled flow
    if (appConfig.ssiEnabled) {
      const command = {
        documentId: asset.id,
        serviceId: service.id,
        consumerAddress: accountId,
        policyServer: {
          sessionId: '',
          successRedirectUri: '',
          errorRedirectUri: '',
          responseRedirectUri: '',
          presentationDefinitionUri: ''
        }
      }

      const initializePs = await ProviderInstance.initializePSVerification(
        customProviderUrl || service.serviceEndpoint,
        command
      )

      if (initializePs?.success) {
        return await ProviderInstance.initialize(
          asset.id,
          service.id,
          0,
          accountId,
          customProviderUrl || service.serviceEndpoint
        )
      }

      throw new Error(`Provider initialization failed: ${initializePs.error}`)
    }
    return await ProviderInstance.initialize(
      asset.id,
      service.id,
      0,
      accountId,
      customProviderUrl || service.serviceEndpoint
    )
  } catch (error: any) {
    const message = getErrorMessage(error.message)
    LoggerInstance.log('[Initialize Provider] Error:', message)
    toast.error(message)
    throw new Error(message)
  }
}

/**
 * @param signer
 * @param asset
 * @param orderPriceAndFees
 * @param accountId
 * @param providerFees
 * @param computeConsumerAddress
 * @returns {ethers.providers.TransactionResponse | BigNumber} receipt of the order
 */
export async function order(
  signer: Signer,
  asset: AssetExtended,
  service: Service,
  accessDetails: AccessDetails,
  orderPriceAndFees: OrderPriceAndFees,
  accountId: string,
  hasDatatoken: boolean,
  providerFees?: ProviderFees,
  computeConsumerAddress?: string
): Promise<TransactionResponse> {
  const datatoken = new Datatoken(
    signer as any,
    asset.credentialSubject?.chainId
  )
  const config = getOceanConfig(asset.credentialSubject?.chainId)
  const serviceIndex = asset.credentialSubject?.services.findIndex(
    (s: Service) => s.id === service.id
  )
  if (serviceIndex === -1) {
    throw new Error(`Service with id ${service.id} not found in the DDO.`)
  }
  const orderParams = {
    consumer: computeConsumerAddress || accountId,
    serviceIndex,
    _providerFee: providerFees || orderPriceAndFees?.providerFee,
    _consumeMarketFee: {
      consumeMarketFeeAddress: marketFeeAddress,
      consumeMarketFeeAmount: consumeMarketOrderFee,
      consumeMarketFeeToken:
        accessDetails.baseToken?.address ||
        '0x0000000000000000000000000000000000000000'
    }
  } as OrderParams

  let txResponse: TransactionResponse | undefined

  switch (accessDetails.type) {
    case 'fixed': {
      const freParams = {
        exchangeContract: config.fixedRateExchangeAddress,
        exchangeId: accessDetails.addressOrId,
        maxBaseTokenAmount: orderPriceAndFees?.price,
        baseTokenAddress: accessDetails.baseToken?.address,
        baseTokenDecimals: accessDetails.baseToken?.decimals || 18,
        swapMarketFee: consumeMarketFixedSwapFee,
        marketFeeAddress
      } as FreOrderParams
      if (accessDetails.templateId === 1) {
        if (!hasDatatoken) {
          const approveAmount = orderPriceAndFees?.price

          const tx: any = await approve(
            signer as any,
            config,
            await signer.getAddress(),
            accessDetails.baseToken.address,
            config.fixedRateExchangeAddress,
            approveAmount,
            false
          )

          const txApprove =
            typeof tx !== 'number' ? await (tx as any).wait() : tx

          if (!txApprove) return

          const fre = new FixedRateExchange(
            config.fixedRateExchangeAddress,
            signer as any
          )

          const freTx = await fre.buyDatatokens(
            accessDetails.addressOrId,
            '1',
            orderPriceAndFees?.price,
            marketFeeAddress,
            '0'
          )
          await (freTx as any).wait()
        }

        const startOrderTx = await datatoken.startOrder(
          accessDetails.datatoken.address,
          orderParams.consumer,
          orderParams.serviceIndex,
          orderParams._providerFee,
          orderParams._consumeMarketFee
        )
        txResponse = startOrderTx as unknown as TransactionResponse
      }
      if (accessDetails.templateId === 2) {
        const providerFeeWei =
          providerFees?.providerFeeAmount ||
          orderPriceAndFees.providerFee?.providerFeeAmount ||
          '0'
        const baseTokenDecimals = accessDetails.baseToken?.decimals || 18
        const providerFeeHuman = formatUnits(
          providerFeeWei as BigNumberish,
          baseTokenDecimals
        )
        const approveAmount = (
          Number(orderPriceAndFees?.price) +
          Number(orderPriceAndFees?.opcFee) +
          Number(providerFeeHuman) +
          Number(Number(consumeMarketOrderFee) / 10 ** baseTokenDecimals)
        ) // just added more amount to test
          .toString()
        console.log('[order] TEMPLATE 2 total approve amount:', approveAmount)
        freParams.maxBaseTokenAmount = (
          Number(freParams.maxBaseTokenAmount) +
          Number(orderPriceAndFees?.opcFee) +
          Number(providerFeeHuman)
        ).toString()

        const tx: any = await approve(
          signer as any,
          config,
          accountId,
          accessDetails.baseToken.address,
          accessDetails.datatoken.address,
          approveAmount,
          false
        )
        const txApprove = typeof tx !== 'number' ? await (tx as any).wait() : tx
        console.log('[order] TEMPLATE 2 approve tx confirmed:', txApprove)
        // --- wait until allowance is actually reflected ---
        const decimals = accessDetails.baseToken?.decimals || 18

        const parsedApproveAmount = BigInt(parseUnits(approveAmount, decimals))

        let currentAllowance: bigint = BigInt(0)

        while (currentAllowance < parsedApproveAmount) {
          const allowanceValue = await allowance(
            signer as any,
            accessDetails.baseToken.address,
            accountId,
            accessDetails.datatoken.address
          )
          try {
            currentAllowance = BigInt(parseUnits(allowanceValue, decimals))
          } catch (err) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            continue
          }

          if (currentAllowance < parsedApproveAmount) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
        console.log('buyFromFreAndOrder params:', {
          datatokenAddress: accessDetails.datatoken.address,
          orderParams,
          freParams
        })
        const buyTx = await datatoken.buyFromFreAndOrder(
          accessDetails.datatoken.address,
          orderParams,
          freParams
        )
        txResponse = buyTx as unknown as TransactionResponse
      }
      break
    }
    case 'free': {
      if (accessDetails.templateId === 1) {
        const dispenser = new Dispenser(config.dispenserAddress, signer as any)
        await dispenser.dispense(
          accessDetails.datatoken.address,
          '1',
          accountId
        )
        const startOrderTx = await datatoken.startOrder(
          accessDetails.datatoken.address,
          orderParams.consumer,
          orderParams.serviceIndex,
          orderParams._providerFee,
          orderParams._consumeMarketFee
        )
        txResponse = startOrderTx as unknown as TransactionResponse
      }
      if (accessDetails.templateId === 2) {
        const providerFeeWei =
          providerFees?.providerFeeAmount ||
          orderPriceAndFees.providerFee?.providerFeeAmount ||
          '0'
        const baseTokenDecimals = accessDetails.baseToken?.decimals || 18
        const providerFeeHuman = formatUnits(
          providerFeeWei as BigNumberish,
          baseTokenDecimals
        )
        const { oceanTokenAddress } = getOceanConfig(
          asset.credentialSubject?.chainId
        )
        const tx: any = await approve(
          signer as any,
          config,
          accountId,
          oceanTokenAddress,
          accessDetails.datatoken.address,
          providerFeeHuman,
          false
        )

        const txApprove = typeof tx !== 'number' ? await (tx as any).wait() : tx
        console.log('[order] TEMPLATE 2 free approve tx confirmed:', txApprove)
        const buyTx = await datatoken.buyFromDispenserAndOrder(
          service.datatokenAddress,
          orderParams,
          config.dispenserAddress
        )
        txResponse = buyTx as unknown as TransactionResponse
      }
    }
  }

  if (txResponse) {
    return txResponse
  }
  throw new Error('Order function failed to return a transaction.')
}

/**
 * called when having a valid order, but with expired provider access, requires approval of the provider fee
 * @param signer
 * @param asset
 * @param accountId
 * @param validOrderTx
 * @param providerFees
 * @returns {TransactionReceipt} receipt of the order
 */
export async function reuseOrder(
  signer: Signer,
  accessDetails: AccessDetails,
  validOrderTx: string,
  providerFees: ProviderFees
): Promise<TransactionResponse> {
  const datatoken = new Datatoken(signer as any)

  const tx = await datatoken.reuseOrder(
    accessDetails.datatoken.address,
    validOrderTx,
    providerFees
  )

  return tx as unknown as TransactionResponse
}

async function approveProviderFee(
  asset: AssetExtended,
  accessDetails: AccessDetails,
  accountId: string,
  signer: Signer,
  providerFeeAmount: string
): Promise<TransactionResponse> {
  const config = getOceanConfig(asset.credentialSubject?.chainId)
  const baseToken =
    accessDetails.type === 'free'
      ? getOceanConfig(asset.credentialSubject?.chainId).oceanTokenAddress
      : accessDetails.baseToken?.address
  const txApproveWei = await approveWei(
    signer as any,
    config,
    accountId,
    baseToken,
    accessDetails.datatoken?.address,
    providerFeeAmount
  )
  return txApproveWei as unknown as TransactionResponse
}

/**
 * Handles order for compute assets for the following scenarios:
 * - have validOrder and no providerFees -> then order is valid, providerFees are valid, it returns the valid order value
 * - have validOrder and providerFees -> then order is valid but providerFees are not valid, we need to call reuseOrder and pay only providerFees
 * - no validOrder -> we need to call order, to pay 1 DT & providerFees
 * @param signer
 * @param asset
 * @param orderPriceAndFees
 * @param accountId
 * @param hasDatatoken
 * @param initializeData
 * @param computeConsumerAddress
 * @returns {Promise<string>} tx id
 */
export async function handleComputeOrder(
  signer: Signer,
  asset: AssetExtended,
  service: Service,
  accessDetails: AccessDetails,
  orderPriceAndFees: OrderPriceAndFees,
  accountId: string,
  initializeData: ProviderComputeInitialize,
  hasDatatoken,
  verifierSessionId: string,
  computeConsumerAddress?: string
): Promise<string> {
  LoggerInstance.log(
    '[compute] Handle compute order for asset type:',
    asset?.credentialSubject?.metadata?.type
  )
  LoggerInstance.log('[compute] Using initializeData:', initializeData)

  try {
    if (accessDetails.validOrderTx) {
      return accessDetails.validOrderTx
    }

    if (!initializeData) {
      console.error('initializeData is missing')
      throw new Error('No initializeData found, please try again.')
    }

    if (initializeData?.validOrder && !initializeData.providerFee) {
      return accessDetails.validOrderTx
    }

    // Approve potential Provider fee amount first
    if (initializeData?.providerFee?.providerFeeAmount !== '0') {
      try {
        const txApproveProvider = await approveProviderFee(
          asset,
          accessDetails,
          accountId,
          signer,
          initializeData.providerFee.providerFeeAmount
        )

        if (!txApproveProvider)
          throw new Error('Failed to approve provider fees!')

        LoggerInstance.log(
          '[compute] Approved provider fees:',
          txApproveProvider
        )
      } catch (approveErr) {
        console.error('Error during approveProviderFee:', approveErr)
        throw approveErr
      }
    } else {
      console.log('No provider fee approval required.')
    }

    // Reuse order flow
    if (initializeData?.validOrder) {
      LoggerInstance.log('[compute] Calling reuseOrder ...', initializeData)
      try {
        const txReuseOrder = await reuseOrder(
          signer,
          accessDetails,
          initializeData.validOrder,
          initializeData.providerFee
        )
        if (!txReuseOrder) throw new Error('Failed to reuse order!')

        const tx = await txReuseOrder.wait()
        return tx?.hash
      } catch (reuseErr) {
        console.error('reuseOrder failed:', reuseErr)
        throw reuseErr
      }
    }

    // Main order flow
    LoggerInstance.log(
      '[compute] Calling order ...',
      initializeData,
      orderPriceAndFees,
      asset,
      service
    )

    try {
      const txStartOrder = await order(
        signer,
        asset,
        service,
        accessDetails,
        orderPriceAndFees,
        accountId,
        hasDatatoken,
        initializeData.providerFee,
        computeConsumerAddress
      )

      const tx = await txStartOrder.wait()
      return tx?.hash
    } catch (orderErr: any) {
      console.error('order() call failed:', orderErr)
      console.error('Error details:', {
        reason: orderErr.reason,
        code: orderErr.code,
        method: orderErr.method,
        transaction: orderErr.transaction,
        data: orderErr.error?.data
      })
      toast.error(orderErr?.message || 'Order failed')
      throw orderErr
    }
  } catch (error: any) {
    console.error('Top-level handleComputeOrder error:', error)
    toast.error(error?.message || 'Unknown error during compute order')
    LoggerInstance.error(`[compute] ${error?.message}`)
    throw error
  }
}
