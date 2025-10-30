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
import { Signer, ethers } from 'ethers'
import { getOceanConfig } from './ocean'
import appConfig, {
  marketFeeAddress,
  consumeMarketOrderFee,
  consumeMarketFixedSwapFee,
  customProviderUrl,
  oceanTokenAddress
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
): Promise<ethers.providers.TransactionResponse> {
  const datatoken = new Datatoken(signer, asset.credentialSubject?.chainId)
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
            signer,
            config,
            await signer.getAddress(),
            accessDetails.baseToken.address,
            config.fixedRateExchangeAddress,
            approveAmount,
            false
          )

          const txApprove = typeof tx !== 'number' ? await tx.wait() : tx

          if (!txApprove) return

          const fre = new FixedRateExchange(
            config.fixedRateExchangeAddress,
            signer
          )

          const freTx = await fre.buyDatatokens(
            accessDetails.addressOrId,
            '1',
            orderPriceAndFees?.price,
            marketFeeAddress,
            '0'
          )
          const buyDtTx = await freTx.wait()
        }

        return await datatoken.startOrder(
          accessDetails.datatoken.address,
          orderParams.consumer,
          orderParams.serviceIndex,
          orderParams._providerFee,
          orderParams._consumeMarketFee
        )
      }
      if (accessDetails.templateId === 2) {
        const providerFeeWei =
          providerFees?.providerFeeAmount ||
          orderPriceAndFees.providerFee?.providerFeeAmount ||
          '0'
        const baseTokenDecimals = accessDetails.baseToken?.decimals || 18
        const providerFeeHuman = ethers.utils.formatUnits(
          providerFeeWei,
          baseTokenDecimals
        )
        const approveAmount = (
          Number(orderPriceAndFees?.price) +
          Number(orderPriceAndFees?.opcFee) +
          Number(providerFeeHuman)
        ) // just added more amount to test
          .toString()
        console.log('approvedAmount', approveAmount)
        freParams.maxBaseTokenAmount = (
          Number(freParams.maxBaseTokenAmount) +
          (Number(freParams.maxBaseTokenAmount) +
            Number(orderPriceAndFees?.opcFee)) +
          Number(providerFeeHuman)
        ).toString()

        const tx: any = await approve(
          signer,
          config,
          accountId,
          accessDetails.baseToken.address,
          accessDetails.datatoken.address,
          approveAmount,
          false
        )
        const txApprove = typeof tx !== 'number' ? await tx.wait() : tx
        console.log('[order] TEMPLATE 2 approve tx confirmed:', txApprove)
        // --- wait until allowance is actually reflected ---
        const decimals = accessDetails.baseToken?.decimals || 18

        // ensure approveAmount is a proper BigNumber
        const parsedApproveAmount = ethers.utils.parseUnits(
          approveAmount,
          decimals
        )

        let currentAllowance: ethers.BigNumber = ethers.BigNumber.from(0)

        while (currentAllowance.lt(parsedApproveAmount)) {
          // get allowance in BigNumber directly
          const allowanceValue = await allowance(
            signer,
            accessDetails.baseToken.address,
            accountId,
            accessDetails.datatoken.address
          )
          try {
            // parse allowance safely
            currentAllowance = ethers.utils.parseUnits(allowanceValue, decimals)
          } catch (err) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            continue
          }

          if (currentAllowance.lt(parsedApproveAmount)) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
        }
        const buyTx = await datatoken.buyFromFreAndOrder(
          accessDetails.datatoken.address,
          orderParams,
          freParams
        )
        console.log(
          '[order] TEMPLATE 2 buyFromFreAndOrder tx sent:',
          buyTx.hash
        )
        return buyTx
      }
      break
    }
    case 'free': {
      if (accessDetails.templateId === 1) {
        const dispenser = new Dispenser(config.dispenserAddress, signer)
        const dispenserTx = await dispenser.dispense(
          accessDetails.datatoken.address,
          '1',
          accountId
        )
        return await datatoken.startOrder(
          accessDetails.datatoken.address,
          orderParams.consumer,
          orderParams.serviceIndex,
          orderParams._providerFee,
          orderParams._consumeMarketFee
        )
      }
      if (accessDetails.templateId === 2) {
        console.log('providerFee', providerFees, orderPriceAndFees)
        const providerFeeWei =
          providerFees?.providerFeeAmount ||
          orderPriceAndFees.providerFee?.providerFeeAmount ||
          '0'
        const baseTokenDecimals = accessDetails.baseToken?.decimals || 18
        const providerFeeHuman = ethers.utils.formatUnits(
          providerFeeWei,
          baseTokenDecimals
        )
        console.log('approvedAmount', providerFeeHuman)
        const tx: any = await approve(
          signer,
          config,
          accountId,
          oceanTokenAddress,
          accessDetails.datatoken.address,
          providerFeeHuman,
          false
        )

        const txApprove = typeof tx !== 'number' ? await tx.wait() : tx
        console.log('[order] TEMPLATE 2 free approve tx confirmed:', txApprove)
        return await datatoken.buyFromDispenserAndOrder(
          service.datatokenAddress,
          orderParams,
          config.dispenserAddress
        )
      }
    }
  }
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
): Promise<ethers.providers.TransactionResponse> {
  const datatoken = new Datatoken(signer)

  const tx = await datatoken.reuseOrder(
    accessDetails.datatoken.address,
    validOrderTx,
    providerFees
  )

  return tx
}

async function approveProviderFee(
  asset: AssetExtended,
  accessDetails: AccessDetails,
  accountId: string,
  signer: Signer,
  providerFeeAmount: string
): Promise<ethers.providers.TransactionResponse> {
  const config = getOceanConfig(asset.credentialSubject?.chainId)
  const baseToken =
    accessDetails.type === 'free'
      ? getOceanConfig(asset.credentialSubject?.chainId).oceanTokenAddress
      : accessDetails.baseToken?.address
  const txApproveWei = await approveWei(
    signer,
    config,
    accountId,
    baseToken,
    accessDetails.datatoken?.address,
    providerFeeAmount
  )
  return txApproveWei
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
        return tx?.transactionHash
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
      return tx?.transactionHash
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
  }
}
