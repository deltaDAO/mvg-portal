import { useState, ReactElement, useEffect, useCallback } from 'react'
import {
  FileInfo,
  Datatoken,
  ProviderInstance,
  ZERO_ADDRESS,
  ComputeEnvironment,
  LoggerInstance,
  ComputeAlgorithm,
  ProviderComputeInitializeResults,
  unitsToAmount,
  ProviderFees,
  UserCustomParameters,
  getErrorMessage,
  EscrowContract,
  ComputeAsset
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
import { secondsToString } from '@utils/ddo'
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
import {
  getAvailablePrice,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'
import { getComputeFeedback } from '@utils/feedback'
import {
  getComputeEnvironments,
  initializeProviderForCompute
} from '@utils/provider'
import { useUserPreferences } from '@context/UserPreferences'
import { getDummySigner } from '@utils/wallet'
import WhitelistIndicator from './WhitelistIndicator'
import { parseConsumerParameterValues } from '../ConsumerParameters'
import { BigNumber, ethers, Signer } from 'ethers'
import { useAccount } from 'wagmi'
import { Service } from '../../../../@types/ddo/Service'
import { Asset, AssetPrice } from '../../../../@types/Asset'
import { AssetExtended } from '../../../../@types/AssetExtended'
import { AssetActionCheckCredentials } from '../CheckCredentials'
import { useSsiWallet } from '@context/SsiWallet'
import { checkVerifierSessionId } from '@utils/wallet/policyServer'
import appConfig, { oceanTokenAddress } from 'app.config.cjs'
import { ResourceType } from 'src/@types/ResourceType'
import { handleComputeOrder } from '@utils/order'
import { getSvcIndex } from './utils'

export default function Compute({
  accountId,
  signer,
  asset,
  service,
  accessDetails,
  dtBalance,
  file,
  isAccountIdWhitelisted,
  fileIsLoading,
  consumableFeedback
}: {
  accountId: string
  signer: Signer
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  fileIsLoading?: boolean
  consumableFeedback?: string
}): ReactElement {
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

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
  const [termsAndConditions, setTermsAndConditions] = useState<boolean>(false)
  const [acceptPublishingLicense, setAcceptPublishingLicense] =
    useState<boolean>(false)
  const [initializedProviderResponse, setInitializedProviderResponse] =
    useState<ProviderComputeInitializeResults>()
  const [providerFeesSymbol, setProviderFeesSymbol] = useState<string>('OCEAN')
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
  const {
    verifierSessionCache,
    lookupVerifierSessionId,
    lookupVerifierSessionIdSkip
  } = useSsiWallet()
  const [svcIndex, setSvcIndex] = useState(0)

  const [allResourceValues, setAllResourceValues] = useState<{
    [envId: string]: ResourceType
  }>({})

  const selectedEnvId = Object.keys(allResourceValues)[0]
  const selectedComputeEnv = computeEnvs?.find(
    (env) => env.id === selectedEnvId
  )
  const selectedResources = selectedEnvId
    ? allResourceValues[selectedEnvId]
    : undefined

  const price: AssetPrice = getAvailablePrice(accessDetails)

  const hasDatatoken = Number(dtBalance) >= 1
  const isComputeButtonDisabled =
    isOrdering === true ||
    file === null ||
    (!validOrderTx && !hasDatatoken && !isConsumablePrice) ||
    (!validAlgorithmOrderTx &&
      !hasAlgoAssetDatatoken &&
      !isConsumableaAlgorithmPrice)

  const isUnsupportedPricing = accessDetails.type === 'NOT_SUPPORTED'

  useEffect(() => {
    const response = getSvcIndex(service, selectedAlgorithmAsset)
    setSvcIndex(response)
  }, [service, selectedAlgorithmAsset])

  async function checkAssetDTBalance(algoAsset: AssetExtended | undefined) {
    try {
      if (!algoAsset?.credentialSubject?.services[svcIndex].datatokenAddress)
        return
      const dummySigner = await getDummySigner(
        algoAsset?.credentialSubject?.chainId
      )
      const datatokenInstance = new Datatoken(
        dummySigner,
        algoAsset.credentialSubject.chainId
      )
      const dtBalance = await datatokenInstance.balance(
        algoAsset?.credentialSubject?.services[svcIndex].datatokenAddress,
        accountId || ZERO_ADDRESS // if the user is not connected, we use ZERO_ADDRESS as accountId
      )
      setAlgorithmDTBalance(new Decimal(dtBalance).toString())
      const hasAlgoDt = Number(dtBalance) >= 1
      setHasAlgoAssetDatatoken(hasAlgoDt)
    } catch (error) {
      LoggerInstance.error(error)
    }
  }
  async function setDatasetPrice(datasetProviderFees: ProviderFees) {
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

      setDatasetOrderPriceAndFees(datasetPriceAndFees)
      return datasetPriceAndFees
    }
  }

  async function initPriceAndFees() {
    try {
      if (!selectedComputeEnv || !selectedComputeEnv.id || !selectedResources)
        throw new Error(`Error getting compute environment!`)
      const initializedProvider = await initializeProviderForCompute(
        asset,
        service,
        accessDetails,
        selectedAlgorithmAsset,
        signer,
        selectedComputeEnv,
        selectedResources,
        svcIndex
      )
      if (
        !initializedProvider ||
        !initializedProvider?.datasets ||
        !initializedProvider?.algorithm
      )
        throw new Error(`Error initializing provider for the compute job!`)
      setComputeStatusText(
        getComputeFeedback(
          accessDetails.baseToken?.symbol,
          accessDetails.datatoken?.symbol,
          asset.credentialSubject?.metadata.type
        )[0]
      )
      const datasetOrderPriceResponse = await setDatasetPrice(
        initializedProvider?.datasets?.[0]?.providerFee
      )
      setComputeStatusText(
        getComputeFeedback(
          selectedAlgorithmAsset?.accessDetails[svcIndex]?.baseToken?.symbol,
          selectedAlgorithmAsset?.accessDetails[svcIndex]?.datatoken?.symbol,
          selectedAlgorithmAsset?.credentialSubject?.metadata?.type
        )[0]
      )
      // await setAlgoPrice(initializedProvider?.algorithm?.providerFee)
      const escrow = new EscrowContract(
        ethers.utils.getAddress(initializedProvider.payment.escrowAddress),
        signer,
        asset.credentialSubject.chainId
      )
      const price = BigNumber.from(selectedResources.price)
      const payment = BigNumber.from(initializedProvider.payment.amount)

      const amountToDeposit = price
        .mul(BigNumber.from(10).pow(18))
        .add(payment)
        .toString()
      await escrow.verifyFundsForEscrowPayment(
        oceanTokenAddress,
        selectedComputeEnv.consumerAddress,
        await unitsToAmount(signer, oceanTokenAddress, amountToDeposit),
        initializedProvider.payment.amount.toString(),
        initializedProvider.payment.minLockSeconds.toString(),
        '10'
      )
      setInitializedProviderResponse(initializedProvider)
      return { initializedProvider, datasetOrderPriceResponse, svcIndex }
    } catch (error) {
      setError(error.message)
      LoggerInstance.error(`[compute] ${error.message} `)
    }
  }

  useEffect(() => {
    if (!accessDetails || !accountId || isUnsupportedPricing) return

    setIsConsumablePrice(accessDetails.isPurchasable)
    setValidOrderTx(accessDetails.validOrderTx)
  }, [accessDetails, accountId, isUnsupportedPricing])

  useEffect(() => {
    if (isUnsupportedPricing) return

    getAlgorithmsForAsset(asset, service, newCancelToken()).then(
      (algorithmsAssets) => {
        setDdoAlgorithmList(algorithmsAssets)

        getAlgorithmAssetSelectionList(
          service,
          algorithmsAssets,
          accountId
        ).then((algorithmSelectionList) => {
          setAlgorithmList(algorithmSelectionList)
        })
      }
    )
  }, [accountId, asset, service, isUnsupportedPricing, newCancelToken])

  const initializeComputeEnvironment = useCallback(async () => {
    const computeEnvs = await getComputeEnvironments(
      service.serviceEndpoint,
      asset.credentialSubject?.chainId
    )
    setComputeEnvs(computeEnvs || [])
  }, [asset, service])

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
          asset.credentialSubject?.chainId !== undefined
            ? [asset.credentialSubject.chainId]
            : chainIds,
          address,
          asset,
          service,
          newCancelToken()
        )
        setJobs(computeJobs.computeJobs)
        setIsLoadingJobs(!computeJobs.isLoaded)
      } catch (error) {
        LoggerInstance.error(error.message)
        setIsLoadingJobs(false)
      }
    },
    [address, accountId, asset, service, chainIds, newCancelToken]
  )

  useEffect(() => {
    fetchJobs('init')
  }, [refetchJobs])

  // Output errors in toast UI
  useEffect(() => {
    const newError = error
    if (!newError) return
    const errorMsg = newError + '. Please retry.'
    toast.error(errorMsg)
  }, [error])

  async function setAlgoPrice(algoProviderFees: ProviderFees) {
    if (
      selectedAlgorithmAsset?.accessDetails?.[0]?.addressOrId !==
        ZERO_ADDRESS &&
      selectedAlgorithmAsset?.accessDetails?.[0]?.type !== 'free' &&
      algoProviderFees
    ) {
      const algorithmOrderPriceAndFees = await getOrderPriceAndFees(
        selectedAlgorithmAsset,
        selectedAlgorithmAsset.credentialSubject?.services?.[0],
        selectedAlgorithmAsset.accessDetails?.[0],
        accountId || ZERO_ADDRESS,
        signer,
        algoProviderFees
      )
      if (!algorithmOrderPriceAndFees)
        throw new Error('Error setting algorithm price and fees!')

      setAlgoOrderPriceAndFees(algorithmOrderPriceAndFees)
      return algorithmOrderPriceAndFees
    }
  }

  async function startJob(userCustomParameters: {
    dataServiceParams?: UserCustomParameters
    algoServiceParams?: UserCustomParameters
    algoParams?: UserCustomParameters
  }): Promise<void> {
    try {
      setIsOrdering(true)
      setIsOrdered(false)
      setError(undefined)

      const { datasetOrderPriceResponse, initializedProvider, svcIndex } =
        await initPriceAndFees()

      const computeAlgorithm: ComputeAlgorithm = {
        documentId: selectedAlgorithmAsset?.id,
        serviceId:
          selectedAlgorithmAsset?.credentialSubject?.services[svcIndex].id,
        algocustomdata: userCustomParameters?.algoParams,
        userdata: userCustomParameters?.algoServiceParams
      }

      const allowed = await isOrderable(
        asset,
        service.id,
        computeAlgorithm,
        selectedAlgorithmAsset
      )
      if (!allowed) throw new Error('Dataset is not orderable.')

      setComputeStatusText(
        getComputeFeedback(
          selectedAlgorithmAsset.accessDetails?.[0]?.baseToken?.symbol,
          selectedAlgorithmAsset.accessDetails?.[0]?.datatoken?.symbol,
          selectedAlgorithmAsset.credentialSubject?.metadata.type
        )[selectedAlgorithmAsset.accessDetails?.[0]?.type === 'fixed' ? 2 : 3]
      )
      const algoOrderPriceAndFeesResponse = await setAlgoPrice(
        initializedProviderResponse?.algorithm?.providerFee ||
          initializedProvider?.algorithm?.providerFee
      )
      const algorithmOrderTx = await handleComputeOrder(
        signer,
        selectedAlgorithmAsset,
        selectedAlgorithmAsset?.credentialSubject?.services[svcIndex],
        selectedAlgorithmAsset?.accessDetails[svcIndex],
        algoOrderPriceAndFees || algoOrderPriceAndFeesResponse,
        accountId,
        initializedProviderResponse?.algorithm ||
          initializedProvider?.algorithm,
        hasAlgoAssetDatatoken,
        lookupVerifierSessionId(asset.id, service.id),
        selectedComputeEnv.consumerAddress
      )
      if (!algorithmOrderTx) throw new Error('Failed to order algorithm.')
      setComputeStatusText(
        getComputeFeedback(
          accessDetails.baseToken?.symbol,
          accessDetails.datatoken?.symbol,
          asset.credentialSubject?.metadata.type
        )[accessDetails.type === 'fixed' ? 2 : 3]
      )
      const datasetOrderTx = await handleComputeOrder(
        signer,
        asset,
        service,
        accessDetails,
        datasetOrderPriceAndFees || datasetOrderPriceResponse,
        accountId,
        initializedProviderResponse?.datasets[0] ||
          initializedProvider?.datasets[0],
        hasDatatoken,
        lookupVerifierSessionId(asset.id, service.id),
        selectedComputeEnv.consumerAddress
      )
      if (!datasetOrderTx) throw new Error('Failed to order dataset.')

      LoggerInstance.log('[compute] Starting compute job.')
      computeAlgorithm.transferTxId = algorithmOrderTx
      setComputeStatusText(getComputeFeedback()[4])
      const resourceRequests = selectedComputeEnv.resources.map((res) => ({
        id: res.id,
        amount: selectedResources[res.id] || res.min
      }))

      if (selectedResources.mode === 'paid') {
        await ProviderInstance.computeStart(
          service.serviceEndpoint,
          signer,
          selectedComputeEnv.id,
          [
            {
              documentId: asset.id,
              serviceId: service.id,
              transferTxId: datasetOrderTx,
              userdata: userCustomParameters?.dataServiceParams
            }
          ],
          computeAlgorithm,
          selectedResources.jobDuration,
          oceanTokenAddress,
          resourceRequests,
          asset.credentialSubject?.chainId
        )
      } else {
        const algorithm: ComputeAlgorithm = {
          documentId: selectedAlgorithmAsset?.id,
          serviceId:
            selectedAlgorithmAsset?.credentialSubject?.services[svcIndex].id,
          meta: selectedAlgorithmAsset?.credentialSubject?.metadata
            ?.algorithm as any
        }

        await ProviderInstance.freeComputeStart(
          service.serviceEndpoint,
          signer,
          selectedComputeEnv.id,
          [
            {
              documentId: asset.id,
              serviceId: service.id
            }
          ],
          algorithm,
          resourceRequests
        )
      }

      setIsOrdered(true)
      setRefetchJobs(!refetchJobs)
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
    try {
      const skip = lookupVerifierSessionIdSkip(asset.id, service.id)
      if (appConfig.ssiEnabled && !skip) {
        const result = await checkVerifierSessionId(
          lookupVerifierSessionId(asset.id, service.id)
        )
        if (!result.success) {
          toast.error('Invalid session')
          return
        }
      }

      if (
        !values.algorithm ||
        !values.computeEnv ||
        !values.termsAndConditions ||
        !values.acceptPublishingLicense
      )
        return

      const userCustomParameters = {
        dataServiceParams: parseConsumerParameterValues(
          values?.dataServiceParams,
          service.consumerParameters
        ),
        algoServiceParams: parseConsumerParameterValues(
          values?.algoServiceParams,
          selectedAlgorithmAsset?.credentialSubject?.services[svcIndex]
            .consumerParameters
        ),
        algoParams: parseConsumerParameterValues(
          values?.algoParams,
          selectedAlgorithmAsset?.credentialSubject?.metadata?.algorithm
            ?.consumerParameters
        )
      }

      await startJob(userCustomParameters)
    } catch (error) {
      toast.error(error.message)
      LoggerInstance.error(error)
    }
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

      {isUnsupportedPricing ? null : asset.credentialSubject?.metadata.type ===
        'algorithm' ? (
        <>
          {service.type === 'compute' && (
            <Alert
              text={
                "This algorithm has been set to private by the publisher and can't be downloaded. You can run it against any allowed datasets though!"
              }
              state="info"
            />
          )}
          <AlgorithmDatasetsListForCompute
            asset={asset}
            service={service}
            accessDetails={accessDetails}
          />
        </>
      ) : (
        <Formik
          initialValues={getInitialValues(
            service,
            selectedAlgorithmAsset,
            selectedComputeEnv,
            termsAndConditions,
            acceptPublishingLicense
          )}
          validateOnMount
          validationSchema={getComputeValidationSchema(
            service.consumerParameters,
            selectedAlgorithmAsset?.credentialSubject?.services[svcIndex]
              .consumerParameters,
            selectedAlgorithmAsset?.credentialSubject?.metadata?.algorithm
              ?.consumerParameters
          )}
          onSubmit={(values) => {
            if (
              !lookupVerifierSessionId(asset.id, service.id) &&
              appConfig.ssiEnabled
            ) {
              return
            }
            onSubmit(values)
          }}
        >
          {appConfig.ssiEnabled ? (
            <>
              {verifierSessionCache &&
              lookupVerifierSessionId(asset.id, service.id) ? (
                <FormStartComputeDataset
                  asset={asset}
                  service={service}
                  accessDetails={accessDetails}
                  algorithms={algorithmList}
                  ddoListAlgorithms={ddoAlgorithmList}
                  selectedAlgorithmAsset={selectedAlgorithmAsset}
                  setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
                  isLoading={isOrdering || isRequestingAlgoOrderPrice}
                  isComputeButtonDisabled={isComputeButtonDisabled}
                  hasPreviousOrder={!!validOrderTx}
                  hasDatatoken={hasDatatoken}
                  dtBalance={dtBalance}
                  assetTimeout={secondsToString(service.timeout)}
                  hasPreviousOrderSelectedComputeAsset={!!validAlgorithmOrderTx}
                  hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                  isAccountIdWhitelisted={isAccountIdWhitelisted}
                  datasetSymbol={
                    accessDetails.baseToken?.symbol ||
                    (asset.credentialSubject?.chainId === 137
                      ? 'mOCEAN'
                      : 'OCEAN')
                  }
                  algorithmSymbol={
                    selectedAlgorithmAsset?.accessDetails?.[svcIndex]?.baseToken
                      ?.symbol ||
                    (selectedAlgorithmAsset?.credentialSubject?.chainId === 137
                      ? 'mOCEAN'
                      : 'OCEAN')
                  }
                  providerFeesSymbol={providerFeesSymbol}
                  dtSymbolSelectedComputeAsset={
                    selectedAlgorithmAsset?.accessDetails?.[svcIndex]?.datatoken
                      .symbol
                  }
                  dtBalanceSelectedComputeAsset={algorithmDTBalance}
                  selectedComputeAssetType="algorithm"
                  selectedComputeAssetTimeout={secondsToString(
                    selectedAlgorithmAsset?.credentialSubject?.services[
                      svcIndex
                    ]?.timeout
                  )}
                  allResourceValues={allResourceValues}
                  setAllResourceValues={setAllResourceValues}
                  // lazy comment when removing pricingStepText
                  stepText={computeStatusText}
                  isConsumable={isConsumablePrice}
                  consumableFeedback={consumableFeedback}
                  datasetOrderPriceAndFees={datasetOrderPriceAndFees}
                  algoOrderPriceAndFees={algoOrderPriceAndFees}
                  retry={retry}
                  onRunInitPriceAndFees={async () => {
                    await initPriceAndFees()
                  }}
                  onCheckAlgoDTBalance={() =>
                    checkAssetDTBalance(selectedAlgorithmAsset)
                  }
                  computeEnvs={computeEnvs}
                />
              ) : (
                <AssetActionCheckCredentials asset={asset} service={service} />
              )}
            </>
          ) : (
            <FormStartComputeDataset
              asset={asset}
              service={service}
              accessDetails={accessDetails}
              algorithms={algorithmList}
              ddoListAlgorithms={ddoAlgorithmList}
              selectedAlgorithmAsset={selectedAlgorithmAsset}
              setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
              isLoading={isOrdering || isRequestingAlgoOrderPrice}
              isComputeButtonDisabled={isComputeButtonDisabled}
              hasPreviousOrder={!!validOrderTx}
              hasDatatoken={hasDatatoken}
              dtBalance={dtBalance}
              assetTimeout={secondsToString(service.timeout)}
              hasPreviousOrderSelectedComputeAsset={!!validAlgorithmOrderTx}
              hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
              isAccountIdWhitelisted={isAccountIdWhitelisted}
              datasetSymbol={
                accessDetails.baseToken?.symbol ||
                (asset.credentialSubject?.chainId === 137 ? 'mOCEAN' : 'OCEAN')
              }
              algorithmSymbol={
                selectedAlgorithmAsset?.accessDetails?.[svcIndex]?.baseToken
                  ?.symbol ||
                (selectedAlgorithmAsset?.credentialSubject?.chainId === 137
                  ? 'mOCEAN'
                  : 'OCEAN')
              }
              providerFeesSymbol={providerFeesSymbol}
              dtSymbolSelectedComputeAsset={
                selectedAlgorithmAsset?.accessDetails?.[svcIndex]?.datatoken
                  .symbol
              }
              dtBalanceSelectedComputeAsset={algorithmDTBalance}
              selectedComputeAssetType="algorithm"
              selectedComputeAssetTimeout={secondsToString(
                selectedAlgorithmAsset?.credentialSubject?.services[svcIndex]
                  ?.timeout
              )}
              allResourceValues={allResourceValues}
              setAllResourceValues={setAllResourceValues}
              // lazy comment when removing pricingStepText
              stepText={computeStatusText}
              isConsumable={isConsumablePrice}
              consumableFeedback={consumableFeedback}
              datasetOrderPriceAndFees={datasetOrderPriceAndFees}
              algoOrderPriceAndFees={algoOrderPriceAndFees}
              retry={retry}
              onRunInitPriceAndFees={async () => {
                await initPriceAndFees()
              }}
              onCheckAlgoDTBalance={() =>
                checkAssetDTBalance(selectedAlgorithmAsset)
              }
              computeEnvs={computeEnvs}
            />
          )}
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
      {accountId && accessDetails.datatoken && (
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
