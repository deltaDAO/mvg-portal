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
  EscrowContract
} from '@oceanprotocol/lib'
import { toast } from 'react-toastify'
import Price from '@shared/Price'
import FileIcon from '@shared/FileIcon'
import Alert from '@shared/atoms/Alert'
import { Formik, Form } from 'formik'
import {
  ComputeDatasetForm,
  getComputeValidationSchema,
  getInitialValues,
  initialValues,
  algorithmSteps,
  datasetSteps
} from './_constants'
// import FormStartComputeDataset from './FormComputeDataset'
import styles from './index.module.css'
import SuccessConfetti from '@shared/SuccessConfetti'
import { secondsToString } from '@utils/ddo'
import {
  isOrderable,
  getAlgorithmAssetSelectionList,
  getComputeJobs,
  getAlgorithmsForAsset,
  getAlgorithmAssetSelectionListForComputeWizard
} from '@utils/compute'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
// import AlgorithmDatasetsListForCompute from './AlgorithmDatasetsListForCompute'
import { useCancelToken } from '@hooks/useCancelToken'
import { Decimal } from 'decimal.js'
import {
  getAvailablePrice,
  getOrderPriceAndFees,
  getAccessDetails
} from '@utils/accessDetailsAndPricing'
import { getAsset, getAlgorithmDatasetsForCompute } from '@utils/aquarius'
import { getComputeFeedback } from '@utils/feedback'
import {
  initializeProviderForComputeMulti,
  getComputeEnvironments
} from '@utils/provider'
import { useUserPreferences } from '@context/UserPreferences'
import { getDummySigner } from '@utils/wallet'
import WhitelistIndicator from '../Asset/AssetActions/Compute/WhitelistIndicator'
import { parseConsumerParameterValues } from '../Asset/AssetActions/ConsumerParameters'
import { BigNumber, ethers, Signer } from 'ethers'
import { useAccount } from 'wagmi'
import { Asset, AssetPrice } from 'src/@types/Asset'
import { AssetActionCheckCredentials } from '../Asset/AssetActions/CheckCredentials'
import { useSsiWallet } from '@context/SsiWallet'
import { checkVerifierSessionId } from '@utils/wallet/policyServer'
import appConfig, { oceanTokenAddress } from 'app.config.cjs'
import { ResourceType } from 'src/@types/ResourceType'
import { handleComputeOrder } from '@utils/order'

import { PolicyServerInitiateComputeActionData } from 'src/@types/PolicyServer'
// import FormStartComputeAlgo from './FormComputeAlgorithm'
// import moved above to avoid duplicate imports

import PageHeader from '@shared/Page/PageHeader'
import Title from './Title'
import Actions from './Actions'
import WizardActions from '@shared/WizardActions'
import Navigation from './Navigation'
import Steps from './Steps'
import { validationSchema } from './_validation'
import ContainerForm from '../@shared/atoms/ContainerForm'
import SectionContainer from '../@shared/SectionContainer/SectionContainer'
import { AssetExtended } from 'src/@types/AssetExtended'
// import { AssetExtended } from '../../../../@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import Loader from '@shared/atoms/Loader'
export default function ComputeWizard({
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
  onClick?: () => void
}): ReactElement {
  const { debug } = useUserPreferences()
  console.log('accountId  ', accountId)
  console.log('signer  ', signer)
  console.log('asset  ', asset)
  console.log('accessDetails  ', accessDetails)
  console.log('file  ', file)
  console.log('dtBalance  ', dtBalance)
  console.log('service  ', service)
  // const { asset } = useAsset()
  // const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()

  const [algorithms, setAlgorithms] = useState<AssetSelectionAsset[]>([])
  const [datasets, setDatasets] = useState<AssetSelectionAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isAlgorithm = asset?.credentialSubject.metadata.type === 'algorithm'
  const steps = isAlgorithm ? algorithmSteps : datasetSteps
  const totalSteps = steps.length

  // copied from compute
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

  const [isOrdering, setIsOrdering] = useState(false)
  const [isOrdered, setIsOrdered] = useState(false)
  const [error, setError] = useState<string>()

  const [algorithmList, setAlgorithmList] = useState<AssetSelectionAsset[]>()
  const [datasetList, setDatasetList] = useState<AssetSelectionAsset[]>()

  const [ddoAlgorithmList, setDdoAlgorithmList] = useState<Asset[]>()
  const [selectedAlgorithmAsset, setSelectedAlgorithmAsset] =
    useState<AssetExtended>()
  const [selectedDatasetAsset, setSelectedDatasetAsset] = useState<
    AssetExtended[]
  >([])
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
    lookupVerifierSessionIdSkip,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
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

  const isUnsupportedPricing = accessDetails?.type === 'NOT_SUPPORTED'

  function resetCacheWallet() {
    ssiWalletCache.clearCredentials()
    setCachedCredentials(undefined)
    clearVerifierSessionCache()
  }

  useEffect(() => {
    if (selectedAlgorithmAsset) {
      setSvcIndex(selectedAlgorithmAsset?.serviceIndex)
    }
  }, [selectedAlgorithmAsset])

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
  async function setDatasetPrice(
    actualAsset: AssetExtended,
    actualService: Service,
    actualAccessDetails: AccessDetails,
    datasetProviderFees: ProviderFees
  ) {
    if (
      actualAccessDetails.addressOrId !== ZERO_ADDRESS &&
      actualAccessDetails.type !== 'free' &&
      datasetProviderFees
    ) {
      const datasetPriceAndFees = await getOrderPriceAndFees(
        actualAsset,
        actualService,
        actualAccessDetails,
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

  async function initPriceAndFees(
    datasetServices?: { asset: AssetExtended; service: Service }[],
    computeEnvIdOverride?: string
  ) {
    try {
      // Prefer env from caller (outer form) when provided
      const envId = computeEnvIdOverride || selectedEnvId
      const resolvedComputeEnv = computeEnvs?.find((env) => env.id === envId)
      const resolvedResources = envId ? allResourceValues?.[envId] : undefined

      if (!resolvedComputeEnv || !resolvedComputeEnv.id || !resolvedResources)
        throw new Error(`Error getting compute environment!`)

      const actualDatasetAssets: AssetExtended[] = selectedDatasetAsset.length
        ? selectedDatasetAsset
        : [asset]

      const actualAlgorithmAsset = selectedAlgorithmAsset || asset
      let actualAlgoService = service
      let actualSvcIndex = svcIndex
      let actualAlgoAccessDetails = accessDetails

      const algoServiceId =
        selectedAlgorithmAsset?.id?.split('|')[1] ||
        selectedAlgorithmAsset?.credentialSubject?.services?.[svcIndex]?.id ||
        service.id

      const algoServices = actualAlgorithmAsset.credentialSubject.services || []
      const algoIndex = algoServices.findIndex((s) => s.id === algoServiceId)
      if (algoIndex === -1) throw new Error('Algorithm serviceId not found.')

      actualAlgoService = algoServices[algoIndex]
      actualSvcIndex = algoIndex
      actualAlgoAccessDetails = actualAlgorithmAsset.accessDetails[algoIndex]

      const datasetsForProvider = datasetServices.map(({ asset, service }) => {
        const datasetIndex = asset.credentialSubject.services.findIndex(
          (s) => s.id === service.id
        )
        if (datasetIndex === -1)
          throw new Error(`ServiceId ${service.id} not found in ${asset.id}`)

        return {
          asset,
          service,
          accessDetails: asset.accessDetails[datasetIndex],
          sessionId: lookupVerifierSessionId(asset.id, service.id)
        }
      })

      const algoSessionId = lookupVerifierSessionId(
        actualAlgorithmAsset.id,
        actualAlgoService.id
      )

      const initializedProvider = await initializeProviderForComputeMulti(
        datasetsForProvider,
        actualAlgorithmAsset,
        algoSessionId,
        signer,
        resolvedComputeEnv,
        resolvedResources,
        actualSvcIndex
      )

      if (!initializedProvider)
        throw new Error('Error initializing provider for compute job')

      const datasetResponses = await Promise.all(
        datasetsForProvider.map(
          async ({ asset, service, accessDetails }, i) => {
            const datasetOrderPriceResponse = await setDatasetPrice(
              asset,
              service,
              accessDetails,
              initializedProvider.datasets?.[i]?.providerFee
            )

            const escrow = new EscrowContract(
              ethers.utils.getAddress(
                initializedProvider.payment.escrowAddress
              ),
              signer,
              asset.credentialSubject.chainId
            )

            const price = BigNumber.from(resolvedResources.price)
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

            return {
              actualDatasetAsset: asset,
              actualDatasetService: service,
              actualDatasetAccessDetails: accessDetails,
              datasetOrderPriceResponse,
              initializedProvider
            }
          }
        )
      )

      setComputeStatusText(
        getComputeFeedback(
          actualAlgoAccessDetails?.baseToken?.symbol,
          actualAlgoAccessDetails?.datatoken?.symbol,
          actualAlgorithmAsset?.credentialSubject?.metadata?.type
        )[0]
      )

      setInitializedProviderResponse(initializedProvider)

      return {
        datasetResponses,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider
      }
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
    if (asset.credentialSubject?.metadata.type === 'algorithm') {
      getAlgorithmDatasetsForCompute(
        asset.id,
        service.id,
        service.serviceEndpoint,
        accountId,
        asset.credentialSubject?.chainId,
        newCancelToken()
      ).then((datasetLists) => {
        setDatasetList(datasetLists)
        if (datasetLists && datasetLists.length > 0) {
          setDatasetList(datasetLists)
        }
      })
    } else {
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
    }
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

  async function setAlgoPrice(
    algo: AssetExtended,
    algoService: Service,
    algoAccessDetails,
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

      setAlgoOrderPriceAndFees(algorithmOrderPriceAndFees)
      return algorithmOrderPriceAndFees
    }
  }

  async function startJob(
    userCustomParameters: {
      dataServiceParams?: UserCustomParameters
      algoServiceParams?: UserCustomParameters
      algoParams?: UserCustomParameters
    },
    datasetServices?: { asset: AssetExtended; service: Service }[],
    computeEnvId?: string
  ): Promise<void> {
    try {
      setIsOrdering(true)
      setIsOrdered(false)
      setError(undefined)

      const initResult = await initPriceAndFees(
        datasetServices,
        computeEnvId || selectedEnvId
      )
      if (!initResult || !initResult.datasetResponses) {
        throw new Error('Failed to initialize provider or resolve datasets.')
      }
      const {
        datasetResponses,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider
      } = initResult

      const computeAlgorithm: ComputeAlgorithm = {
        documentId: actualAlgorithmAsset?.id,
        serviceId: actualAlgoService.id,
        algocustomdata: userCustomParameters?.algoParams,
        userdata: userCustomParameters?.algoServiceParams
      }

      // Check isOrderable for all datasets
      for (const ds of datasetResponses) {
        const allowed = await isOrderable(
          ds.actualDatasetAsset,
          ds.actualDatasetService.id,
          computeAlgorithm,
          actualAlgorithmAsset
        )
        if (!allowed)
          throw new Error(
            `Dataset ${ds.actualDatasetAsset.id} is not orderable.`
          )
      }

      setComputeStatusText(
        getComputeFeedback(
          actualAlgoAccessDetails?.baseToken?.symbol,
          actualAlgoAccessDetails?.datatoken?.symbol,
          actualAlgorithmAsset.credentialSubject?.metadata.type
        )[actualAlgoAccessDetails?.type === 'fixed' ? 2 : 3]
      )

      const algoOrderPriceAndFeesResponse = await setAlgoPrice(
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider?.algorithm?.providerFee ||
          initializedProviderResponse?.algorithm?.providerFee
      )
      const algorithmOrderTx = await handleComputeOrder(
        signer,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        algoOrderPriceAndFees || algoOrderPriceAndFeesResponse,
        accountId,
        initializedProvider?.algorithm ||
          initializedProviderResponse?.algorithm,
        hasAlgoAssetDatatoken,
        lookupVerifierSessionId(actualAlgorithmAsset.id, actualAlgoService.id),
        selectedComputeEnv.consumerAddress
      )
      if (!algorithmOrderTx) throw new Error('Failed to order algorithm.')
      console.log('[compute] algorithm order tx', algorithmOrderTx || 'reused')

      // resolve environment & resources consistently using computeEnvId or current selection
      const envId = computeEnvId || selectedEnvId
      const resolvedComputeEnv = computeEnvs?.find((env) => env.id === envId)
      const resolvedResources = envId ? allResourceValues?.[envId] : undefined

      const datasetInputs = []
      const policyDatasets: PolicyServerInitiateComputeActionData[] = []

      for (const ds of datasetResponses) {
        const datasetOrderTx = await handleComputeOrder(
          signer,
          ds.actualDatasetAsset,
          ds.actualDatasetService,
          ds.actualDatasetAccessDetails,
          datasetOrderPriceAndFees || ds.datasetOrderPriceResponse,
          accountId,
          ds.initializedProvider.datasets[0],
          hasDatatoken,
          lookupVerifierSessionId(
            ds.actualDatasetAsset.id,
            ds.actualDatasetService.id
          ),
          resolvedComputeEnv.consumerAddress
        )
        if (!datasetOrderTx)
          throw new Error(
            `Failed to order dataset ${ds.actualDatasetAsset.id}.`
          )
        console.log('[compute] dataset order tx', {
          did: ds.actualDatasetAsset.id,
          serviceId: ds.actualDatasetService.id,
          tx: datasetOrderTx || 'reused'
        })

        datasetInputs.push({
          documentId: ds.actualDatasetAsset.id,
          serviceId: ds.actualDatasetService.id,
          transferTxId: datasetOrderTx,
          userdata: userCustomParameters?.dataServiceParams
        })

        policyDatasets.push({
          sessionId: lookupVerifierSessionId(
            ds.actualDatasetAsset.id,
            ds.actualDatasetService.id
          ),
          serviceId: ds.actualDatasetService.id,
          documentId: ds.actualDatasetAsset.id,
          successRedirectUri: '',
          errorRedirectUri: '',
          responseRedirectUri: '',
          presentationDefinitionUri: ''
        })
      }

      setComputeStatusText(getComputeFeedback()[4])

      const resourceRequests = resolvedComputeEnv.resources.map((res) => ({
        id: res.id,
        amount: resolvedResources[res.id] || res.min
      }))

      const policyServerAlgo: PolicyServerInitiateComputeActionData = {
        sessionId: lookupVerifierSessionId(
          actualAlgorithmAsset.id,
          actualAlgoService.id
        ),
        serviceId: actualAlgoService.id,
        documentId: actualAlgorithmAsset.id,
        successRedirectUri: '',
        errorRedirectUri: '',
        responseRedirectUri: '',
        presentationDefinitionUri: ''
      }

      const policiesServer = [policyServerAlgo, ...policyDatasets]

      let response
      console.log('[compute] starting job', {
        mode: resolvedResources.mode,
        envId: resolvedComputeEnv.id,
        jobDuration: resolvedResources.jobDuration,
        datasetInputs: datasetInputs.length,
        resourceRequests: resourceRequests.length
      })
      if (resolvedResources.mode === 'paid') {
        response = await ProviderInstance.computeStart(
          service.serviceEndpoint,
          signer,
          resolvedComputeEnv.id,
          datasetInputs,
          { ...computeAlgorithm, transferTxId: algorithmOrderTx },
          resolvedResources.jobDuration,
          oceanTokenAddress,
          resourceRequests,
          datasetResponses[0].actualDatasetAsset.credentialSubject.chainId,
          null,
          null,
          policiesServer
        )
        console.log('[compute] computeStart response', !!response)
      } else {
        const algorithm: ComputeAlgorithm = {
          documentId: actualAlgorithmAsset.id,
          serviceId: actualAlgoService.id,
          meta: actualAlgorithmAsset.credentialSubject?.metadata
            ?.algorithm as any
        }

        response = await ProviderInstance.freeComputeStart(
          service.serviceEndpoint,
          signer,
          resolvedComputeEnv.id,
          datasetInputs.map(({ documentId, serviceId }) => ({
            documentId,
            serviceId
          })),
          algorithm,
          resourceRequests,
          null,
          null,
          policiesServer
        )
        console.log('[compute] freeComputeStart response', !!response)
      }

      if (!response)
        throw new Error(
          'Failed to start compute job, check console for more details.'
        )

      setIsOrdered(true)
      setRefetchJobs(!refetchJobs)
    } catch (error) {
      if (
        error?.message?.includes('user rejected transaction') ||
        error?.message?.includes('User denied') ||
        error?.message?.includes('MetaMask Tx Signature: User denied')
      ) {
        toast.info('Transaction was cancelled by user')
        setRetry(true)
        return
      }

      let message: string
      try {
        message =
          error.message && typeof error.message === 'string'
            ? JSON.parse(error.message)
            : error.message || String(error)
      } catch {
        message = error.message || String(error)
      }
      setError(message)
      setRetry(true)
    } finally {
      setIsOrdering(false)
    }
  }

  const onSubmit = async (values: ComputeDatasetForm) => {
    try {
      // Wallet/network guard: avoid provider errors when no wallet connected
      if (!signer || !(signer as any)?.provider) {
        toast.error('Please connect your wallet to start a compute job.')
        return
      }
      try {
        await (signer as any).provider.getNetwork()
      } catch {
        toast.error('Please connect to a supported network to start compute.')
        return
      }

      const skip = lookupVerifierSessionIdSkip(asset?.id, service?.id)

      if (appConfig.ssiEnabled && !skip) {
        try {
          const result = await checkVerifierSessionId(
            lookupVerifierSessionId(asset.id, service.id)
          )
          if (!result.success) {
            toast.error('Invalid session')
            return
          }
        } catch (error) {
          resetCacheWallet()
          throw error
        }
      }

      if (
        !(values.algorithm || values.dataset) ||
        !values.computeEnv ||
        !values.termsAndConditions ||
        !values.acceptPublishingLicense
      ) {
        toast.error('Please complete all required fields.')
        return
      }

      let actualSelectedDataset: AssetExtended[] = []
      let actualSelectedAlgorithm: AssetExtended = selectedAlgorithmAsset

      // Case: dataset selected, algorithm undefined (algo is main asset)
      if (asset.credentialSubject.metadata.type === 'algorithm') {
        actualSelectedAlgorithm = asset
        if (selectedDatasetAsset && Array.isArray(selectedDatasetAsset)) {
          actualSelectedDataset = selectedDatasetAsset
        }
      } else {
        actualSelectedDataset = [asset]
      }

      const userCustomParameters = {
        dataServiceParams: parseConsumerParameterValues(
          values?.dataServiceParams,
          actualSelectedDataset[0]?.credentialSubject?.services?.[0]
            ?.consumerParameters
        ),
        algoServiceParams: parseConsumerParameterValues(
          values?.algoServiceParams,
          actualSelectedAlgorithm?.credentialSubject?.services[svcIndex]
            ?.consumerParameters
        ),
        algoParams: parseConsumerParameterValues(
          values?.algoParams,
          actualSelectedAlgorithm?.credentialSubject?.metadata?.algorithm
            ?.consumerParameters
        )
      }

      let datasetServices: { asset: AssetExtended; service: Service }[] =
        actualSelectedDataset.map((ds, i) => {
          const datasetEntry = values.dataset?.[i]
          const selectedServiceId = datasetEntry?.includes('|')
            ? datasetEntry.split('|')[1]
            : ds.credentialSubject.services?.[0]?.id

          const selectedService =
            ds.credentialSubject.services.find(
              (s) => s.id === selectedServiceId
            ) || ds.credentialSubject.services?.[0]

          return {
            asset: ds,
            service: selectedService
          }
        })

      // If no resolved dataset assets yet, resolve from values.dataset selections
      if (
        (!datasetServices || datasetServices.length === 0) &&
        values.dataset
      ) {
        const newCancel = newCancelToken()
        const resolved: { asset: AssetExtended; service: Service }[] = []
        const resolvedAssets: AssetExtended[] = []

        for (const entry of values.dataset) {
          const [did, serviceId] = entry.split('|')
          const dsAsset: any = await getAsset(did, newCancel)
          if (!dsAsset || !dsAsset?.credentialSubject?.services?.length)
            continue
          const svcIndex = dsAsset.credentialSubject.services.findIndex(
            (s: any) => s.id === serviceId
          )
          const accessDetailsList = await Promise.all(
            dsAsset.credentialSubject.services.map((svc: any) =>
              getAccessDetails(
                dsAsset.credentialSubject.chainId,
                svc,
                accountId || ZERO_ADDRESS,
                newCancel
              )
            )
          )
          const extended: AssetExtended = {
            ...dsAsset,
            accessDetails: accessDetailsList,
            serviceIndex: svcIndex !== -1 ? svcIndex : 0
          }
          const selService =
            dsAsset.credentialSubject.services[svcIndex !== -1 ? svcIndex : 0]
          resolvedAssets.push(extended)
          resolved.push({ asset: extended, service: selService })
        }

        if (resolvedAssets.length) setSelectedDatasetAsset(resolvedAssets)
        datasetServices = resolved
      }

      await startJob(
        userCustomParameters,
        datasetServices,
        (values.computeEnv as unknown as string) || selectedEnvId
      )
    } catch (error) {
      if (
        error?.message?.includes('user rejected transaction') ||
        error?.message?.includes('User denied') ||
        error?.message?.includes('MetaMask Tx Signature: User denied')
      ) {
        toast.info('Transaction was cancelled by user')
        return
      }

      toast.error(error.message)
      LoggerInstance.error(error)
    }
  }

  // copied from compute

  useEffect(() => {
    if (!asset || !accountId) return

    async function fetchData() {
      try {
        setIsLoading(true)
        setError(undefined)

        const computeService = asset.credentialSubject?.services?.find(
          (service) => service.type === 'compute'
        ) as any
        console.log('services for compute. ', computeService)

        if (!computeService) {
          setError('No compute service found for this asset')
          setIsLoading(false)
          return
        }

        const algorithmsAssets = await getAlgorithmsForAsset(
          asset,
          computeService,
          newCancelToken()
        )

        const algorithmSelectionList =
          await getAlgorithmAssetSelectionListForComputeWizard(
            computeService,
            algorithmsAssets,
            accountId
          )

        const environments = await getComputeEnvironments(
          computeService.serviceEndpoint,
          asset.credentialSubject?.chainId
        )
        // const datasets = await getAlgorithmDatasetsForCompute(
        //   asset.id,
        //   service.id,
        //   service.serviceEndpoint,
        //   accountId,
        //   asset.credentialSubject?.chainId,
        //   newCancelToken()
        // )
        // console.log(
        //   'Dataset list for algo...',
        //   JSON.stringify(datasets, null, 2)
        // )

        // setDatasets(datasets)
        setAlgorithms(algorithmSelectionList)
        setComputeEnvs(environments)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load compute data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [asset, accountId, newCancelToken])

  if (!asset) {
    return null
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loader message="Loading compute wizard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2>Error</h2>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={async (values) => {
        console.log('Form submitted:', values)
      }}
    >
      {(formikContext) => (
        <div className={styles.containerOuter}>
          <PageHeader title={<Title asset={asset} />} />
          <Form className={styles.form}>
            <Navigation steps={steps} />
            <SectionContainer classNames={styles.container}>
              {isUnsupportedPricing ? null : asset.credentialSubject?.metadata
                  .type === 'algorithm' ? (
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
                    selectedAlgorithmAsset?.credentialSubject?.services[
                      svcIndex
                    ]?.consumerParameters,
                    selectedAlgorithmAsset?.credentialSubject?.metadata
                      ?.algorithm?.consumerParameters
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
                  {({ values: innerValues }) => (
                    <>
                      <>
                        {service.type === 'compute' && (
                          <Alert
                            text={
                              "This algorithm has been set to private by the publisher and can't be downloaded. You can run it against any allowed datasets though!"
                            }
                            state="info"
                          />
                        )}
                        <Steps
                          asset={asset}
                          service={service}
                          accessDetails={accessDetails}
                          datasets={datasetList}
                          algorithms={algorithmList}
                          selectedDatasetAsset={selectedDatasetAsset}
                          setSelectedDatasetAsset={setSelectedDatasetAsset}
                          isLoading={isOrdering || isRequestingAlgoOrderPrice}
                          isComputeButtonDisabled={isComputeButtonDisabled}
                          hasPreviousOrder={!!validOrderTx}
                          hasDatatoken={hasDatatoken}
                          dtBalance={dtBalance}
                          assetTimeout={secondsToString(service.timeout)}
                          hasPreviousOrderSelectedComputeAsset={
                            !!validAlgorithmOrderTx
                          }
                          hasDatatokenSelectedComputeAsset={
                            hasAlgoAssetDatatoken
                          }
                          isAccountIdWhitelisted={isAccountIdWhitelisted}
                          datasetSymbol={
                            accessDetails.baseToken?.symbol ||
                            (asset.credentialSubject?.chainId === 137
                              ? 'mOCEAN'
                              : 'OCEAN')
                          }
                          algorithmSymbol={
                            selectedAlgorithmAsset?.accessDetails?.[svcIndex]
                              ?.baseToken?.symbol ||
                            (selectedAlgorithmAsset?.credentialSubject
                              ?.chainId === 137
                              ? 'mOCEAN'
                              : 'OCEAN')
                          }
                          providerFeesSymbol={providerFeesSymbol}
                          dtSymbolSelectedComputeAsset={
                            selectedAlgorithmAsset?.accessDetails?.[svcIndex]
                              ?.datatoken.symbol
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
                          stepText={computeStatusText}
                          isConsumable={isConsumablePrice}
                          consumableFeedback={consumableFeedback}
                          datasetOrderPriceAndFees={datasetOrderPriceAndFees}
                          algoOrderPriceAndFees={algoOrderPriceAndFees}
                          retry={retry}
                          computeEnvs={computeEnvs}
                          isAlgorithm={isAlgorithm}
                          formikValues={formikContext.values} // Pass outer formik values
                          setFieldValue={formikContext.setFieldValue} // Pass outer setFieldValue
                          onComputeClick={() => onSubmit(innerValues)}
                        />
                      </>
                    </>
                  )}
                </Formik>
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
                    selectedAlgorithmAsset?.credentialSubject?.services[
                      svcIndex
                    ]?.consumerParameters,
                    selectedAlgorithmAsset?.credentialSubject?.metadata
                      ?.algorithm?.consumerParameters
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
                  {({ values: innerValues }) => (
                    <>
                      <Steps
                        asset={asset}
                        service={service}
                        accessDetails={accessDetails}
                        datasets={datasetList}
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
                        hasPreviousOrderSelectedComputeAsset={
                          !!validAlgorithmOrderTx
                        }
                        hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                        isAccountIdWhitelisted={isAccountIdWhitelisted}
                        datasetSymbol={
                          accessDetails.baseToken?.symbol ||
                          (asset.credentialSubject?.chainId === 137
                            ? 'mOCEAN'
                            : 'OCEAN')
                        }
                        algorithmSymbol={
                          selectedAlgorithmAsset?.accessDetails?.[svcIndex]
                            ?.baseToken?.symbol ||
                          (selectedAlgorithmAsset?.credentialSubject
                            ?.chainId === 137
                            ? 'mOCEAN'
                            : 'OCEAN')
                        }
                        providerFeesSymbol={providerFeesSymbol}
                        dtSymbolSelectedComputeAsset={
                          selectedAlgorithmAsset?.accessDetails?.[svcIndex]
                            ?.datatoken.symbol
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
                        jobs={jobs}
                        isLoadingJobs={isLoadingJobs}
                        refetchJobs={() => setRefetchJobs(!refetchJobs)}
                        formikValues={formikContext.values} // Pass outer formik values
                        setFieldValue={formikContext.setFieldValue} // Pass outer setFieldValue
                        onComputeClick={() => onSubmit(innerValues)}
                      />
                    </>
                  )}
                </Formik>
              )}
              <WizardActions
                totalSteps={totalSteps}
                submitButtonText="Buy Dataset"
                showSuccessConfetti={false}
                rightAlignFirstStep={false}
              />
            </SectionContainer>
          </Form>
          {debug && (
            <div>Debug: {JSON.stringify(formikContext.values, null, 2)}</div>
          )}
        </div>
      )}
    </Formik>
  )
}
