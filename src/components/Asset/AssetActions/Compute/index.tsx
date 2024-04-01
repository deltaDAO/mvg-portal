import { useState, ReactElement, useEffect, useCallback } from 'react'
import {
  Asset,
  DDO,
  FileInfo,
  Datatoken,
  ProviderInstance,
  ComputeAsset,
  ZERO_ADDRESS,
  ComputeEnvironment,
  LoggerInstance,
  ComputeAlgorithm,
  ComputeOutput,
  ProviderComputeInitializeResults,
  unitsToAmount,
  ProviderFees,
  AssetPrice,
  UserCustomParameters,
  getErrorMessage
} from '@oceanprotocol/lib'
import { toast } from 'react-toastify'
import Price from '@shared/Price'
import FileIcon from '@shared/FileIcon'
import Alert from '@shared/atoms/Alert'
import { Formik } from 'formik'
import {
  ComputeDatasetForm,
  getComputeValidationSchema,
  getInitialValues
} from './_constants'
import FormStartComputeDataset from './FormComputeDataset'
import styles from './index.module.css'
import SuccessConfetti from '@shared/SuccessConfetti'
import { getServiceByName, secondsToString } from '@utils/ddo'
import {
  isOrderable,
  getAlgorithmAssetSelectionList,
  getAlgorithmsForAsset,
  getComputeJobs
} from '@utils/compute'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import AlgorithmDatasetsListForCompute from './AlgorithmDatasetsListForCompute'
import ComputeHistory from './History'
import ComputeJobs from '../../../Profile/History/ComputeJobs'
import { useCancelToken } from '@hooks/useCancelToken'
import { Decimal } from 'decimal.js'
import { useAbortController } from '@hooks/useAbortController'
import {
  getAvailablePrice,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'
import { handleComputeOrder } from '@utils/order'
import { getComputeFeedback } from '@utils/feedback'
import {
  getComputeEnvironments,
  initializeProviderForCompute
} from '@utils/provider'
import { useUserPreferences } from '@context/UserPreferences'
import { getDummySigner } from '@utils/wallet'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useAsset } from '@context/Asset'
import WhitelistIndicator from './WhitelistIndicator'
import { parseConsumerParameterValues } from '../ConsumerParameters'
import { Signer } from 'ethers'
import { useAccount } from 'wagmi'

const refreshInterval = 10000 // 10 sec.

export default function Compute({
  accountId,
  signer,
  asset,
  dtBalance,
  file,
  isAccountIdWhitelisted,
  fileIsLoading,
  consumableFeedback
}: {
  accountId: string
  signer: Signer
  asset: AssetExtended
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  fileIsLoading?: boolean
  consumableFeedback?: string
}): ReactElement {
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

  const newAbortController = useAbortController()
  const newCancelToken = useCancelToken()

  const [isOrdering, setIsOrdering] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [error, setError] = useState<string>()

  const [algorithmList, setAlgorithmList] = useState<AssetSelectionAsset[]>()
  const [ddoAlgorithmList, setDdoAlgorithmList] = useState<Asset[]>()
  const [selectedAlgorithmAsset, setSelectedAlgorithmAsset] =
    useState<AssetExtended>()
  const [hasAlgoAssetDatatoken, setHasAlgoAssetDatatoken] = useState<boolean>()
  const [algorithmDTBalance, setAlgorithmDTBalance] = useState<string>()

  const [validOrderTx, setValidOrderTx] = useState('')
  const [validAlgorithmOrderTx, setValidAlgorithmOrderTx] = useState('')

  const [isConsumablePrice, setIsConsumablePrice] = useState(true)
  const [isConsumableaAlgorithmPrice, setIsConsumableAlgorithmPrice] =
    useState(true)
  const [computeStatusText, setComputeStatusText] = useState('')
  const [computeEnvs, setComputeEnvs] = useState<ComputeEnvironment[]>()
  const [selectedComputeEnv, setSelectedComputeEnv] =
    useState<ComputeEnvironment>()
  const [termsAndConditions, setTermsAndConditions] = useState<boolean>(false)
  const [initializedProviderResponse, setInitializedProviderResponse] =
    useState<ProviderComputeInitializeResults>()
  const [providerFeeAmount, setProviderFeeAmount] = useState<string>('0')
  const [providerFeesSymbol, setProviderFeesSymbol] = useState<string>('OCEAN')
  const [computeValidUntil, setComputeValidUntil] = useState<string>('0')
  const [datasetOrderPriceAndFees, setDatasetOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [algoOrderPriceAndFees, setAlgoOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [isRequestingAlgoOrderPrice, setIsRequestingAlgoOrderPrice] =
    useState(false)
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [retry, setRetry] = useState<boolean>(false)
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const { isAssetNetwork } = useAsset()

  const price: AssetPrice = getAvailablePrice(asset)

  const hasDatatoken = Number(dtBalance) >= 1
  const isComputeButtonDisabled =
    isOrdering === true ||
    file === null ||
    (!validOrderTx && !hasDatatoken && !isConsumablePrice) ||
    (!validAlgorithmOrderTx &&
      !hasAlgoAssetDatatoken &&
      !isConsumableaAlgorithmPrice)

  const isUnsupportedPricing = asset?.accessDetails?.type === 'NOT_SUPPORTED'

  async function checkAssetDTBalance(asset: DDO) {
    if (!asset?.services[0].datatokenAddress) return
    const dummySigner = await getDummySigner(asset?.chainId)
    const datatokenInstance = new Datatoken(dummySigner)
    const dtBalance = await datatokenInstance.balance(
      asset?.services[0].datatokenAddress,
      accountId || ZERO_ADDRESS // if the user is not connected, we use ZERO_ADDRESS as accountId
    )
    setAlgorithmDTBalance(new Decimal(dtBalance).toString())
    const hasAlgoDt = Number(dtBalance) >= 1
    setHasAlgoAssetDatatoken(hasAlgoDt)
  }

  async function setComputeFees(
    providerData: ProviderComputeInitializeResults
  ): Promise<ProviderComputeInitializeResults> {
    if (asset.accessDetails.validProviderFees) {
      providerData.datasets[0].providerFee.providerFeeAmount = '0'
    }

    const providerFeeToken =
      providerData?.datasets?.[0]?.providerFee?.providerFeeToken
    const providerFeeAmount = asset.accessDetails.validProviderFees
      ? '0'
      : providerData?.datasets?.[0]?.providerFee?.providerFeeAmount
    const feeValidity = providerData?.datasets?.[0]?.providerFee?.validUntil

    const feeAmount = await unitsToAmount(
      !isSupportedOceanNetwork || !isAssetNetwork
        ? await getDummySigner(asset?.chainId)
        : signer,
      providerFeeToken,
      providerFeeAmount
    )
    setProviderFeeAmount(feeAmount)

    const datatoken = new Datatoken(await getDummySigner(asset?.chainId))
    setProviderFeesSymbol(await datatoken.getSymbol(providerFeeToken))

    const computeDuration = asset.accessDetails.validProviderFees
      ? asset.accessDetails.validProviderFees.validUntil
      : (parseInt(feeValidity) - Math.floor(Date.now() / 1000)).toString()
    setComputeValidUntil(computeDuration)

    return providerData
  }

  async function setAlgoPrice(algoProviderFees: ProviderFees) {
    if (
      selectedAlgorithmAsset?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
      selectedAlgorithmAsset?.accessDetails?.type !== 'free' &&
      algoProviderFees
    ) {
      const algorithmOrderPriceAndFees = await getOrderPriceAndFees(
        selectedAlgorithmAsset,
        accountId || ZERO_ADDRESS,
        signer,
        algoProviderFees
      )
      if (!algorithmOrderPriceAndFees)
        throw new Error('Error setting algorithm price and fees!')

      setAlgoOrderPriceAndFees(algorithmOrderPriceAndFees)
    }
  }

  async function setDatasetPrice(datasetProviderFees: ProviderFees) {
    if (
      asset?.accessDetails?.addressOrId !== ZERO_ADDRESS &&
      asset?.accessDetails?.type !== 'free' &&
      datasetProviderFees
    ) {
      const datasetPriceAndFees = await getOrderPriceAndFees(
        asset,
        accountId || ZERO_ADDRESS,
        signer,
        datasetProviderFees
      )
      if (!datasetPriceAndFees)
        throw new Error('Error setting dataset price and fees!')

      setDatasetOrderPriceAndFees(datasetPriceAndFees)
    }
  }

  async function initPriceAndFees() {
    try {
      if (!selectedComputeEnv || !selectedComputeEnv.id)
        throw new Error(`Error getting compute environment!`)

      const initializedProvider = await initializeProviderForCompute(
        asset,
        selectedAlgorithmAsset,
        accountId || ZERO_ADDRESS, // if the user is not connected, we use ZERO_ADDRESS as accountId
        selectedComputeEnv
      )

      if (
        !initializedProvider ||
        !initializedProvider?.datasets ||
        !initializedProvider?.algorithm
      )
        throw new Error(`Error initializing provider for the compute job!`)

      setComputeStatusText(
        getComputeFeedback(
          asset.accessDetails?.baseToken?.symbol,
          asset.accessDetails?.datatoken?.symbol,
          asset.metadata.type
        )[0]
      )

      await setDatasetPrice(initializedProvider?.datasets?.[0]?.providerFee)
      setComputeStatusText(
        getComputeFeedback(
          selectedAlgorithmAsset?.accessDetails?.baseToken?.symbol,
          selectedAlgorithmAsset?.accessDetails?.datatoken?.symbol,
          selectedAlgorithmAsset?.metadata?.type
        )[0]
      )

      await setAlgoPrice(initializedProvider?.algorithm?.providerFee)
      const sanitizedResponse = await setComputeFees(initializedProvider)
      setInitializedProviderResponse(sanitizedResponse)
    } catch (error) {
      setError(error.message)
      LoggerInstance.error(`[compute] ${error.message} `)
    }
  }

  useEffect(() => {
    if (!asset?.accessDetails || !accountId || isUnsupportedPricing) return

    setIsConsumablePrice(asset?.accessDetails?.isPurchasable)
    setValidOrderTx(asset?.accessDetails?.validOrderTx)
  }, [asset?.accessDetails, accountId, isUnsupportedPricing])

  useEffect(() => {
    if (!selectedAlgorithmAsset?.accessDetails || !selectedComputeEnv) return

    setIsRequestingAlgoOrderPrice(true)
    setIsConsumableAlgorithmPrice(
      selectedAlgorithmAsset?.accessDetails?.isPurchasable
    )
    setValidAlgorithmOrderTx(
      selectedAlgorithmAsset?.accessDetails?.validOrderTx
    )
    setAlgoOrderPriceAndFees(null)

    async function initSelectedAlgo() {
      await checkAssetDTBalance(selectedAlgorithmAsset)
      await initPriceAndFees()
      setIsRequestingAlgoOrderPrice(false)
    }

    initSelectedAlgo()
  }, [selectedAlgorithmAsset, accountId, selectedComputeEnv])

  useEffect(() => {
    if (!asset?.accessDetails || isUnsupportedPricing) return

    getAlgorithmsForAsset(asset, newCancelToken()).then((algorithmsAssets) => {
      setDdoAlgorithmList(algorithmsAssets)
      getAlgorithmAssetSelectionList(asset, algorithmsAssets, accountId).then(
        (algorithmSelectionList) => {
          setAlgorithmList(algorithmSelectionList)
        }
      )
    })
  }, [accountId, asset, isUnsupportedPricing])

  const initializeComputeEnvironment = useCallback(async () => {
    const computeEnvs = await getComputeEnvironments(
      asset.services[0].serviceEndpoint,
      asset.chainId
    )
    setComputeEnvs(computeEnvs || [])
  }, [asset])

  useEffect(() => {
    initializeComputeEnvironment()
  }, [initializeComputeEnvironment])

  const fetchJobs = useCallback(
    async (type: string) => {
      if (!chainIds || chainIds.length === 0 || !accountId) {
        return
      }

      try {
        type === 'init' && setIsLoadingJobs(true)
        const computeJobs = await getComputeJobs(
          [asset?.chainId] || chainIds,
          address,
          asset,
          newCancelToken()
        )
        setJobs(computeJobs.computeJobs)
        setIsLoadingJobs(!computeJobs.isLoaded)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoadingJobs(false)
      }
    },
    [address, accountId, asset, chainIds, newCancelToken]
  )

  useEffect(() => {
    fetchJobs('init')

    // init periodic refresh for jobs
    const balanceInterval = setInterval(
      () => fetchJobs('repeat'),
      refreshInterval
    )

    return () => {
      clearInterval(balanceInterval)
    }
  }, [refetchJobs])

  // Output errors in toast UI
  useEffect(() => {
    const newError = error
    if (!newError) return
    const errorMsg = newError + '. Please retry.'
    toast.error(errorMsg)
  }, [error])

  async function startJob(userCustomParameters: {
    dataServiceParams?: UserCustomParameters
    algoServiceParams?: UserCustomParameters
    algoParams?: UserCustomParameters
  }): Promise<void> {
    try {
      setIsOrdering(true)
      setIsOrdered(false)
      setError(undefined)
      const computeService = getServiceByName(asset, 'compute')
      const computeAlgorithm: ComputeAlgorithm = {
        documentId: selectedAlgorithmAsset.id,
        serviceId: selectedAlgorithmAsset.services[0].id,
        algocustomdata: userCustomParameters?.algoParams,
        userdata: userCustomParameters?.algoServiceParams
      }

      const allowed = await isOrderable(
        asset,
        computeService.id,
        computeAlgorithm,
        selectedAlgorithmAsset
      )
      LoggerInstance.log('[compute] Is dataset orderable?', allowed)
      if (!allowed)
        throw new Error(
          'Dataset is not orderable in combination with selected algorithm.'
        )

      await initPriceAndFees()

      setComputeStatusText(
        getComputeFeedback(
          selectedAlgorithmAsset.accessDetails.baseToken?.symbol,
          selectedAlgorithmAsset.accessDetails.datatoken?.symbol,
          selectedAlgorithmAsset.metadata.type
        )[selectedAlgorithmAsset.accessDetails?.type === 'fixed' ? 2 : 3]
      )

      const algorithmOrderTx = await handleComputeOrder(
        signer,
        selectedAlgorithmAsset,
        algoOrderPriceAndFees,
        accountId,
        initializedProviderResponse.algorithm,
        hasAlgoAssetDatatoken,
        selectedComputeEnv.consumerAddress
      )
      if (!algorithmOrderTx) throw new Error('Failed to order algorithm.')

      setComputeStatusText(
        getComputeFeedback(
          asset.accessDetails.baseToken?.symbol,
          asset.accessDetails.datatoken?.symbol,
          asset.metadata.type
        )[asset.accessDetails?.type === 'fixed' ? 2 : 3]
      )

      const datasetOrderTx = await handleComputeOrder(
        signer,
        asset,
        datasetOrderPriceAndFees,
        accountId,
        initializedProviderResponse.datasets[0],
        hasDatatoken,
        selectedComputeEnv.consumerAddress
      )
      if (!datasetOrderTx) throw new Error('Failed to order dataset.')

      LoggerInstance.log('[compute] Starting compute job.')
      const computeAsset: ComputeAsset = {
        documentId: asset.id,
        serviceId: asset.services[0].id,
        transferTxId: datasetOrderTx,
        userdata: userCustomParameters?.dataServiceParams
      }
      computeAlgorithm.transferTxId = algorithmOrderTx
      const output: ComputeOutput = {
        publishAlgorithmLog: true,
        publishOutput: true
      }
      setComputeStatusText(getComputeFeedback()[4])
      const response = await ProviderInstance.computeStart(
        asset.services[0].serviceEndpoint,
        signer,
        selectedComputeEnv?.id,
        computeAsset,
        computeAlgorithm,
        newAbortController(),
        null,
        output
      )
      if (!response) throw new Error('Error starting compute job.')

      LoggerInstance.log('[compute] Starting compute job response: ', response)
      setIsOrdered(true)
      setRefetchJobs(!refetchJobs)
      initPriceAndFees()
    } catch (error) {
      const message = getErrorMessage(error.message)
      LoggerInstance.error('[Compute] Error:', message)
      setError(message)
      setRetry(true)
    } finally {
      setIsOrdering(false)
    }
  }

  const onSubmit = async (values: ComputeDatasetForm) => {
    if (!values.algorithm || !values.computeEnv || !values.termsAndConditions)
      return

    const userCustomParameters = {
      dataServiceParams: parseConsumerParameterValues(
        values?.dataServiceParams,
        asset.services[0].consumerParameters
      ),
      algoServiceParams: parseConsumerParameterValues(
        values?.algoServiceParams,
        selectedAlgorithmAsset?.services[0].consumerParameters
      ),
      algoParams: parseConsumerParameterValues(
        values?.algoParams,
        selectedAlgorithmAsset?.metadata?.algorithm?.consumerParameters
      )
    }

    await startJob(userCustomParameters)
  }

  return (
    <>
      <div
        className={`${styles.info} ${
          isUnsupportedPricing ? styles.warning : null
        }`}
      >
        <FileIcon
          file={file}
          isAccountWhitelisted={isAccountIdWhitelisted}
          isLoading={fileIsLoading}
          small
        />
        {isUnsupportedPricing ? (
          <Alert
            text={`No pricing schema available for this asset.`}
            state="info"
          />
        ) : (
          <Price
            price={price}
            orderPriceAndFees={datasetOrderPriceAndFees}
            size="large"
          />
        )}
      </div>

      {isUnsupportedPricing ? null : asset.metadata.type === 'algorithm' ? (
        <>
          {asset.services[0].type === 'compute' && (
            <Alert
              text={
                "This algorithm has been set to private by the publisher and can't be downloaded. You can run it against any allowed datasets though!"
              }
              state="info"
            />
          )}
          <AlgorithmDatasetsListForCompute
            algorithmDid={asset.id}
            asset={asset}
          />
        </>
      ) : (
        <Formik
          initialValues={getInitialValues(
            asset,
            selectedAlgorithmAsset,
            selectedComputeEnv,
            termsAndConditions
          )}
          validateOnMount
          validationSchema={getComputeValidationSchema(
            asset.services[0].consumerParameters,
            selectedAlgorithmAsset?.services[0].consumerParameters,
            selectedAlgorithmAsset?.metadata?.algorithm?.consumerParameters
          )}
          enableReinitialize
          onSubmit={onSubmit}
        >
          <FormStartComputeDataset
            algorithms={algorithmList}
            ddoListAlgorithms={ddoAlgorithmList}
            selectedAlgorithmAsset={selectedAlgorithmAsset}
            setSelectedAlgorithm={setSelectedAlgorithmAsset}
            isLoading={isOrdering || isRequestingAlgoOrderPrice}
            isComputeButtonDisabled={isComputeButtonDisabled}
            hasPreviousOrder={!!validOrderTx}
            hasDatatoken={hasDatatoken}
            dtBalance={dtBalance}
            assetType={asset?.metadata.type}
            assetTimeout={secondsToString(asset?.services[0].timeout)}
            hasPreviousOrderSelectedComputeAsset={!!validAlgorithmOrderTx}
            hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            datasetSymbol={
              asset?.accessDetails?.baseToken?.symbol ||
              (asset?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            algorithmSymbol={
              selectedAlgorithmAsset?.accessDetails?.baseToken?.symbol ||
              (selectedAlgorithmAsset?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
            }
            providerFeesSymbol={providerFeesSymbol}
            dtSymbolSelectedComputeAsset={
              selectedAlgorithmAsset?.datatokens[0]?.symbol
            }
            dtBalanceSelectedComputeAsset={algorithmDTBalance}
            selectedComputeAssetType="algorithm"
            selectedComputeAssetTimeout={secondsToString(
              selectedAlgorithmAsset?.services[0]?.timeout
            )}
            computeEnvs={computeEnvs}
            setSelectedComputeEnv={setSelectedComputeEnv}
            setTermsAndConditions={setTermsAndConditions}
            // lazy comment when removing pricingStepText
            stepText={computeStatusText}
            isConsumable={isConsumablePrice}
            consumableFeedback={consumableFeedback}
            datasetOrderPriceAndFees={datasetOrderPriceAndFees}
            algoOrderPriceAndFees={algoOrderPriceAndFees}
            providerFeeAmount={providerFeeAmount}
            validUntil={computeValidUntil}
            retry={retry}
          />
        </Formik>
      )}

      <footer className={styles.feedback}>
        {isOrdered && (
          <SuccessConfetti success="Your job started successfully! Watch the progress below or on your profile." />
        )}
      </footer>
      {accountId && (
        <WhitelistIndicator
          accountId={accountId}
          isAccountIdWhitelisted={isAccountIdWhitelisted}
        />
      )}
      {accountId && asset?.accessDetails?.datatoken && (
        <ComputeHistory
          title="Your Compute Jobs"
          refetchJobs={() => setRefetchJobs(!refetchJobs)}
        >
          <ComputeJobs
            minimal
            jobs={jobs}
            isLoading={isLoadingJobs}
            refetchJobs={() => setRefetchJobs(!refetchJobs)}
          />
        </ComputeHistory>
      )}
    </>
  )
}
