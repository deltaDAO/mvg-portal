import { useCallback, useState } from 'react'
import {
  ComputeEnvironment,
  ProviderComputeInitializeResults,
  ProviderFees,
  EscrowContract,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import { initializeProviderForComputeMulti } from '@utils/provider'
import { getOrderPriceAndFees } from '@utils/accessDetailsAndPricing'
import { getTokenInfo } from '@utils/wallet'
import { ethers, Signer } from 'ethers'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ResourceType } from 'src/@types/ResourceType'

type DatasetServiceSelection = {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  sessionId: string
}

type InitializeParams = {
  datasetsForProvider: DatasetServiceSelection[]
  algorithmAsset: AssetExtended
  algorithmService: Service
  algorithmAccessDetails: AccessDetails
  algoSessionId?: string
  signer: Signer
  selectedComputeEnv: ComputeEnvironment
  selectedResources: ResourceType
  algoIndex: number
  algoParams?: Record<string, any>
  datasetParams?: Record<string, any>
  accountId?: string
  shouldDepositEscrow?: boolean
}

type InitializeResult = {
  initializedProvider: ProviderComputeInitializeResults
  datasetResponses: Array<{
    asset: AssetExtended
    service: Service
    accessDetails: AccessDetails
    datasetOrderPriceResponse?: OrderPriceAndFees
  }>
  algoOrderPriceAndFees?: OrderPriceAndFees
}

async function setDatasetPrice(
  asset: AssetExtended,
  service: Service,
  accessDetails: AccessDetails,
  accountId: string,
  signer: Signer,
  datasetProviderFees: ProviderFees
) {
  if (
    accessDetails.addressOrId !== ZERO_ADDRESS &&
    accessDetails.type !== 'free' &&
    datasetProviderFees
  ) {
    const datasetPriceAndFees = await getOrderPriceAndFees(
      asset,
      service,
      accessDetails,
      accountId || ZERO_ADDRESS,
      signer,
      datasetProviderFees
    )
    if (!datasetPriceAndFees)
      throw new Error('Error setting dataset price and fees!')

    return datasetPriceAndFees
  }
}

async function setAlgoPrice(
  algo: AssetExtended,
  algoService: Service,
  algoAccessDetails: AccessDetails,
  accountId: string,
  signer: Signer,
  algoProviderFees: ProviderFees
) {
  if (
    algoAccessDetails.addressOrId !== ZERO_ADDRESS &&
    algoAccessDetails?.type !== 'free' &&
    algoProviderFees
  ) {
    const algorithmOrderPriceAndFees = await getOrderPriceAndFees(
      algo,
      algoService,
      algoAccessDetails,
      accountId || ZERO_ADDRESS,
      signer,
      algoProviderFees
    )
    if (!algorithmOrderPriceAndFees)
      throw new Error('Error setting algorithm price and fees!')

    return algorithmOrderPriceAndFees
  }
}

export function useComputeInitialization({
  oceanTokenAddress,
  web3Provider
}: {
  oceanTokenAddress?: string
  web3Provider?: any
}) {
  const [initializedProviderResponse, setInitializedProviderResponse] =
    useState<ProviderComputeInitializeResults>()
  const [datasetProviderFee, setDatasetProviderFee] = useState<string | null>(
    null
  )
  const [algorithmProviderFee, setAlgorithmProviderFee] = useState<
    string | null
  >(null)
  const [extraFeesLoaded, setExtraFeesLoaded] = useState(false)
  const [isInitLoading, setIsInitLoading] = useState(false)
  const [initError, setInitError] = useState<string>()

  const initializePricingAndProvider = useCallback(
    async ({
      datasetsForProvider,
      algorithmAsset,
      algorithmService,
      algorithmAccessDetails,
      algoSessionId,
      signer,
      selectedComputeEnv,
      selectedResources,
      algoIndex,
      algoParams,
      datasetParams,
      accountId,
      shouldDepositEscrow = true
    }: InitializeParams): Promise<InitializeResult> => {
      setIsInitLoading(true)
      setInitError(undefined)

      try {
        const initializedProvider = await initializeProviderForComputeMulti(
          datasetsForProvider,
          algorithmAsset,
          algoSessionId,
          signer,
          selectedComputeEnv,
          selectedResources,
          algoIndex,
          algoParams,
          datasetParams
        )

        if (!initializedProvider) {
          throw new Error('Error initializing provider for compute job')
        }

        const datasetResponses = await Promise.all(
          datasetsForProvider.map(
            async ({ asset, service, accessDetails }, i) => {
              const datasetOrderPriceResponse = await setDatasetPrice(
                asset,
                service,
                accessDetails,
                accountId,
                signer,
                initializedProvider.datasets?.[i]?.providerFee
              )

              return {
                asset,
                service,
                accessDetails,
                datasetOrderPriceResponse
              }
            }
          )
        )

        if (shouldDepositEscrow && selectedResources.mode === 'paid') {
          if (!oceanTokenAddress || !web3Provider) {
            throw new Error('Missing token or provider for escrow payment')
          }

          const escrow = new EscrowContract(
            ethers.getAddress(initializedProvider.payment.escrowAddress),
            signer,
            algorithmAsset.credentialSubject.chainId
          )

          const amountHuman = String(selectedResources.price || 0)
          const tokenDetails = await getTokenInfo(
            oceanTokenAddress,
            web3Provider
          )
          const amountWei = ethers.parseUnits(
            amountHuman,
            tokenDetails.decimals
          )

          const erc20 = new ethers.Contract(
            oceanTokenAddress,
            [
              'function approve(address spender, uint256 amount) returns (bool)',
              'function allowance(address owner, address spender) view returns (uint256)'
            ],
            signer
          )

          const owner = await signer.getAddress()
          const escrowAddress = (
            escrow.contract.target ?? escrow.contract.address
          ).toString()

          if (amountWei !== BigInt(0)) {
            const approveTx = await erc20.approve(escrowAddress, amountWei)
            await approveTx.wait()
            while (true) {
              const allowanceNow = await erc20.allowance(owner, escrowAddress)
              if (allowanceNow >= amountWei) {
                break
              }
              await new Promise((resolve) => setTimeout(resolve, 1000))
            }

            const depositTx = await escrow.deposit(
              oceanTokenAddress,
              amountHuman
            )
            await depositTx.wait()
            await escrow.authorize(
              oceanTokenAddress,
              selectedComputeEnv.consumerAddress,
              initializedProvider.payment.amount.toString(),
              selectedResources.jobDuration.toString(),
              '10'
            )
          }
        }

        const algoOrderPriceAndFees = await setAlgoPrice(
          algorithmAsset,
          algorithmService,
          algorithmAccessDetails,
          accountId,
          signer,
          initializedProvider.algorithm?.providerFee
        )

        setAlgorithmProviderFee(
          initializedProvider?.algorithm?.providerFee?.providerFeeAmount || '0'
        )

        const datasetFees =
          initializedProvider?.datasets?.map(
            (ds) => ds?.providerFee?.providerFeeAmount || null
          ) || []
        const totalDatasetFee =
          datasetFees.length > 0 && datasetFees.some((f) => f !== null)
            ? datasetFees.reduce((acc, fee) => acc + Number(fee || 0), 0)
            : null

        setDatasetProviderFee(
          totalDatasetFee !== null ? totalDatasetFee.toString() : '0'
        )
        setInitializedProviderResponse(initializedProvider)
        setExtraFeesLoaded(true)

        return {
          initializedProvider,
          datasetResponses,
          algoOrderPriceAndFees
        }
      } catch (error) {
        const message =
          (error as Error)?.message || 'Provider initialization failed.'
        setInitError(message)
        throw error
      } finally {
        setIsInitLoading(false)
      }
    },
    [oceanTokenAddress, web3Provider]
  )

  return {
    initializePricingAndProvider,
    initializedProviderResponse,
    datasetProviderFee,
    algorithmProviderFee,
    extraFeesLoaded,
    isInitLoading,
    initError,
    setInitError
  }
}
