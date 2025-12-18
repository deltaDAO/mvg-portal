import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import { Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Decimal } from 'decimal.js'
import { Signer } from 'ethers'
import { useAccount } from 'wagmi'
import {
  Datatoken,
  FileInfo,
  LoggerInstance,
  UserCustomParameters,
  ZERO_ADDRESS
} from '@oceanprotocol/lib'
import styles from './index.module.css'
import { Asset } from 'src/@types/Asset'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import { ResourceType } from 'src/@types/ResourceType'
import { ComputeFlow, FormComputeData } from './_types'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import Title from './Title'
import Navigation from './Navigation'
import Steps from './Steps'
import SuccessState from './SuccessState'
import SectionContainer from '../@shared/SectionContainer/SectionContainer'
import WizardActions from '@shared/WizardActions'
import { LoadingState, ErrorState } from './WizardState'
import { createInitialValues } from './_steps'
import { validationSchema } from './_validation'
import { CredentialDialogProvider } from '../Asset/AssetActions/Compute/CredentialDialogProvider'
import { useAsset } from '@context/Asset'
import { useUserPreferences } from '@context/UserPreferences'
import { useSsiWallet } from '@context/SsiWallet'
import { secondsToString } from '@utils/ddo'
import {
  getAlgorithmAssetSelectionList,
  getAlgorithmAssetSelectionListForComputeWizard,
  getAlgorithmsForAsset
} from '@utils/compute'
import { getAlgorithmDatasetsForCompute } from '@utils/aquarius'
import { getDummySigner, getTokenInfo } from '@utils/wallet'
import { checkVerifierSessionId } from '@utils/wallet/policyServer'
import { getOceanConfig } from '@utils/ocean'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useCancelToken } from '@hooks/useCancelToken'
import { useComputeEnvironments } from './hooks/useComputeEnvironments'
import { useComputeInitialization } from './hooks/useComputeInitialization'
import { useComputeJobs } from './hooks/useComputeJobs'
import { useComputeSubmission } from './hooks/useComputeSubmission'
import { getSelectedComputeEnvAndResources } from './hooks/computeEnvSelection'
import { resetCredentialCache } from './hooks/resetCredentialCache'
import appConfig from 'app.config.cjs'

type ParamValue = string | number | boolean | undefined

type UserParameter = {
  name: string
  value?: ParamValue
  default?: ParamValue
}

interface ControllerProps {
  accountId: string
  signer: Signer
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  consumableFeedback?: string
  onClose?: () => void
  onComputeJobCreated?: () => void
  mode?: ComputeFlow
}

export default function ComputeWizardController({
  accountId,
  signer,
  asset,
  service,
  accessDetails,
  dtBalance,
  file,
  isAccountIdWhitelisted,
  consumableFeedback,
  onClose,
  onComputeJobCreated,
  mode
}: ControllerProps): ReactElement {
  useUserPreferences()
  const { isAssetNetwork } = useAsset()
  const { isConnected } = useAccount()
  const config = getOceanConfig(asset.credentialSubject.chainId)
  const { oceanTokenAddress } = config
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const web3Provider = signer?.provider

  const [isLoading, setIsLoading] = useState(true)
  const flow: ComputeFlow =
    mode ||
    (asset?.credentialSubject.metadata.type === 'algorithm'
      ? 'algorithm'
      : 'dataset')
  const isAlgorithmFlow = flow === 'algorithm'
  const initialFormValues = useMemo(() => createInitialValues(flow), [flow])

  // copied from compute
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

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
  const [validAlgorithmOrderTx] = useState('')

  const [validOrderTx, setValidOrderTx] = useState('')
  const [datasetOrderPriceAndFees, setDatasetOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [algoOrderPriceAndFees, setAlgoOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [isBalanceSufficient, setIsBalanceSufficient] = useState<boolean>(true)

  const [isConsumablePrice, setIsConsumablePrice] = useState(true)
  const [providerFeesSymbol, setProviderFeesSymbol] = useState('OCEAN')
  const { computeEnvs, computeEnvsError } = useComputeEnvironments({
    serviceEndpoint: service?.serviceEndpoint,
    chainId: asset.credentialSubject?.chainId
  })
  const {
    initializePricingAndProvider,
    datasetProviderFee,
    algorithmProviderFee,
    extraFeesLoaded,
    isInitLoading,
    initError,
    setInitError
  } = useComputeInitialization({
    oceanTokenAddress,
    web3Provider
  })
  const {
    jobs,
    isLoadingJobs,
    computeJobsError,
    refetchJobs: refetchComputeJobs
  } = useComputeJobs({
    asset,
    service,
    accountId,
    ownerAddress: address,
    chainIds,
    cancelTokenFactory: newCancelToken
  })
  const {
    startJob: submitComputeJob,
    isOrdering,
    computeStatusText,
    successJobId,
    showSuccess,
    setShowSuccess,
    retry,
    submitError,
    setSubmitError
  } = useComputeSubmission()
  const {
    lookupVerifierSessionId,
    lookupVerifierSessionIdSkip,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
  } = useSsiWallet()

  const [svcIndex, setSvcIndex] = useState(0)
  const [isSubmittingJob, setIsSubmittingJob] = useState(false)

  const [allResourceValues, setAllResourceValues] = useState<{
    [envId: string]: ResourceType
  }>({})

  const selectEnvAndResources = useCallback(
    (formikValues: FormComputeData | Record<string, never>) =>
      getSelectedComputeEnvAndResources(
        computeEnvs,
        allResourceValues,
        formikValues
      ),
    [computeEnvs, allResourceValues]
  )

  const getSelectedDatasetServices = useCallback(
    (formikValues: FormComputeData | Record<string, never>) => {
      const typedValues = formikValues as FormComputeData
      if (typedValues?.withoutDataset) return []
      if (!selectedDatasetAsset || selectedDatasetAsset.length === 0) return []

      const datasetEntries = typedValues?.dataset
      return selectedDatasetAsset.map((ds, index) => {
        const datasetEntry = datasetEntries?.[index]
        const selectedServiceId = datasetEntry?.includes('|')
          ? datasetEntry.split('|')[1]
          : ds.credentialSubject.services?.[0]?.id

        const selectedService =
          ds.credentialSubject.services.find(
            (svc) => svc.id === selectedServiceId
          ) || ds.credentialSubject.services?.[0]

        return {
          asset: ds,
          service: selectedService
        }
      })
    },
    [selectedDatasetAsset]
  )

  const hasDatatoken = Number(dtBalance) >= 1
  const isAlgorithmConsumable = asset?.accessDetails?.[0]?.isPurchasable ?? true
  const datasetFlowBlocked =
    !isAlgorithmFlow && !validOrderTx && !hasDatatoken && !isConsumablePrice
  const algorithmFlowBlocked =
    isAlgorithmFlow &&
    ((!validOrderTx && !hasDatatoken && !isConsumablePrice) ||
      (!validAlgorithmOrderTx &&
        !hasAlgoAssetDatatoken &&
        !isAlgorithmConsumable))
  const isComputeButtonDisabled =
    isOrdering === true ||
    isSubmittingJob === true ||
    file === null ||
    datasetFlowBlocked ||
    algorithmFlowBlocked

  const isUnsupportedPricing = accessDetails?.type === 'NOT_SUPPORTED'

  const resetCacheWallet = useCallback(() => {
    resetCredentialCache(
      ssiWalletCache,
      setCachedCredentials,
      clearVerifierSessionCache
    )
  }, [ssiWalletCache, setCachedCredentials, clearVerifierSessionCache])

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
  async function initPriceAndFees(
    datasetServices?: { asset: AssetExtended; service: Service }[],
    formikValues?: FormComputeData,
    withEscrow = true
  ) {
    try {
      const formValues = formikValues || initialFormValues
      const effectiveDatasetServices =
        datasetServices && datasetServices.length > 0
          ? datasetServices
          : isAlgorithmFlow
          ? getSelectedDatasetServices(formValues)
          : [{ asset, service }]
      const { selectedComputeEnv, selectedResources } = selectEnvAndResources(
        formValues || {}
      )

      if (!selectedComputeEnv || !selectedComputeEnv.id || !selectedResources)
        throw new Error('Error getting compute environment!')

      if (
        isAlgorithmFlow &&
        !formValues?.withoutDataset &&
        !effectiveDatasetServices.length
      ) {
        throw new Error('Please select at least one dataset.')
      }

      const actualAlgorithmAsset = isAlgorithmFlow
        ? asset
        : selectedAlgorithmAsset || asset
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

      const datasetsForProvider = effectiveDatasetServices.map(
        ({ asset, service }) => {
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
        }
      )

      const algoSessionId = lookupVerifierSessionId(
        actualAlgorithmAsset.id,
        actualAlgoService.id
      )
      const groupedParams = formValues?.updatedGroupedUserParameters
      const algoParams: Record<string, ParamValue> = {}
      if (groupedParams?.algoParams?.length > 0) {
        groupedParams.algoParams.forEach((algoEntry) => {
          algoEntry.userParameters?.forEach((param: UserParameter) => {
            algoParams[param.name] = param.value ?? param.default ?? ''
          })
        })
      }
      const datasetParams: Record<string, ParamValue> = {}
      if (groupedParams?.datasetParams?.length > 0) {
        const datasetEntry = groupedParams.datasetParams[0]
        datasetEntry.userParameters?.forEach((param: UserParameter) => {
          datasetParams[param.name] = param.value ?? param.default ?? ''
        })
      }

      const initResult = await initializePricingAndProvider({
        datasetsForProvider,
        algorithmAsset: actualAlgorithmAsset,
        algorithmService: actualAlgoService,
        algorithmAccessDetails: actualAlgoAccessDetails,
        algoSessionId,
        signer,
        selectedComputeEnv,
        selectedResources,
        algoIndex: actualSvcIndex,
        algoParams,
        datasetParams,
        accountId,
        shouldDepositEscrow: withEscrow
      })

      if (!initResult)
        throw new Error('Error initializing provider for compute job')

      setDatasetOrderPriceAndFees(
        initResult.datasetResponses?.[0]?.datasetOrderPriceResponse
      )
      setAlgoOrderPriceAndFees(initResult.algoOrderPriceAndFees)

      return {
        datasetResponses: initResult.datasetResponses,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider: initResult.initializedProvider,
        selectedComputeEnv,
        selectedResources
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to initialize provider.'
      setError(message)
      LoggerInstance.error(`[compute] ${message}`)
      throw err
    }
  }

  useEffect(() => {
    if (!accessDetails || !accountId || isUnsupportedPricing) return

    setIsConsumablePrice(accessDetails.isPurchasable)
    setValidOrderTx(accessDetails.validOrderTx)
  }, [accessDetails, accountId, isUnsupportedPricing])

  useEffect(() => {
    if (isUnsupportedPricing) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadAssets() {
      try {
        setIsLoading(true)
        if (isAlgorithmFlow) {
          const datasetLists = await getAlgorithmDatasetsForCompute(
            asset.id,
            service.id,
            service.serviceEndpoint,
            accountId,
            asset.credentialSubject?.chainId,
            newCancelToken()
          )
          if (!cancelled) setDatasetList(datasetLists || [])
        } else {
          const algorithmsAssets = await getAlgorithmsForAsset(
            asset,
            service,
            newCancelToken()
          )
          if (!cancelled) setDdoAlgorithmList(algorithmsAssets)
          const algorithmSelectionList =
            await getAlgorithmAssetSelectionListForComputeWizard(
              service,
              algorithmsAssets,
              accountId
            )
          if (!cancelled) setAlgorithmList(algorithmSelectionList)
        }
        if (!cancelled) setError(undefined)
      } catch (err) {
        if (!cancelled) {
          setError((err as Error)?.message || 'Failed to load compute assets.')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadAssets()

    return () => {
      cancelled = true
    }
  }, [
    accountId,
    asset,
    service,
    isUnsupportedPricing,
    newCancelToken,
    isAlgorithmFlow
  ])

  // Output errors in toast UI
  useEffect(() => {
    const newError = error
    if (!newError) return
    const errorMsg = newError + '. Please retry.'
    toast.error(errorMsg)
  }, [error])

  useEffect(() => {
    if (!initError) return
    toast.error(initError)
    setInitError(undefined)
  }, [initError, setInitError])

  useEffect(() => {
    if (!submitError) return
    toast.error(submitError)
    setSubmitError(undefined)
  }, [submitError, setSubmitError])

  useEffect(() => {
    if (computeEnvsError) {
      toast.error(computeEnvsError)
    }
  }, [computeEnvsError])

  useEffect(() => {
    if (computeJobsError) {
      toast.error(computeJobsError)
    }
  }, [computeJobsError])

  useEffect(() => {
    if (!oceanTokenAddress || !web3Provider || !isAlgorithmFlow) return

    let cancelled = false
    async function fetchTokenDetails() {
      try {
        const tokenDetails = await getTokenInfo(oceanTokenAddress, web3Provider)
        if (!cancelled && tokenDetails?.symbol) {
          setProviderFeesSymbol(tokenDetails.symbol)
        }
      } catch (error) {
        LoggerInstance.error(error)
      }
    }

    fetchTokenDetails()

    return () => {
      cancelled = true
    }
  }, [oceanTokenAddress, web3Provider, isAlgorithmFlow])

  async function startJob(
    userCustomParameters: {
      dataServiceParams?: UserCustomParameters
      algoServiceParams?: UserCustomParameters
      algoParams?: UserCustomParameters
    },
    datasetServices?: { asset: AssetExtended; service: Service }[],
    formikValues?: FormComputeData
  ): Promise<void> {
    setIsSubmittingJob(true)
    try {
      const {
        datasetResponses,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider,
        selectedComputeEnv,
        selectedResources
      } = await initPriceAndFees(datasetServices, formikValues)

      if (!datasetResponses || !selectedComputeEnv || !selectedResources) {
        throw new Error('Missing compute initialization data.')
      }

      await submitComputeJob({
        datasetResponses,
        algorithmAsset: actualAlgorithmAsset,
        algorithmService: actualAlgoService,
        algorithmAccessDetails: actualAlgoAccessDetails,
        initializedProvider,
        selectedComputeEnv,
        selectedResources,
        accountId,
        signer,
        hasDatatoken,
        hasAlgoAssetDatatoken,
        userCustomParameters,
        lookupVerifierSessionId,
        algoOrderPriceAndFees,
        datasetOrderPriceAndFees,
        paymentTokenAddress: accessDetails?.baseToken?.address,
        oceanTokenAddress,
        computeServiceEndpoint: service.serviceEndpoint
      })

      await refetchComputeJobs('init')
      resetCacheWallet()
      onComputeJobCreated?.()
    } catch (error) {
      if (
        (error as Error)?.message?.includes('user rejected transaction') ||
        (error as Error)?.message?.includes('User denied') ||
        (error as Error)?.message?.includes(
          'MetaMask Tx Signature: User denied'
        )
      ) {
        toast.info('Transaction was cancelled by user')
        return
      }

      const message =
        (error as Error)?.message || 'Failed to start compute job.'
      setError(message)
      throw error
    } finally {
      setIsSubmittingJob(false)
    }
  }

  const onSubmit = async (values: FormComputeData) => {
    try {
      if (isAlgorithmFlow) {
        const skip = lookupVerifierSessionIdSkip(asset?.id, service?.id)

        if (appConfig.ssiEnabled && !skip) {
          try {
            const sessionId = lookupVerifierSessionId(asset.id, service.id)
            const result = await checkVerifierSessionId(sessionId)
            if (!result?.success) {
              toast.error(
                'Credentials expired. Please re-verify your credentials.'
              )
              return
            }
          } catch (error) {
            resetCacheWallet()
            throw error
          }
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

      const { selectedComputeEnv, selectedResources } =
        selectEnvAndResources(values)
      if (!selectedComputeEnv || !selectedResources) {
        toast.error(
          'Please configure the compute environment resources before proceeding.'
        )
        return
      }

      if (
        isAlgorithmFlow &&
        !values.withoutDataset &&
        (!values.dataset || values.dataset.length === 0)
      ) {
        toast.error(
          'Please select at least one dataset to run against the algorithm.'
        )
        return
      }

      let actualSelectedDataset: AssetExtended[] = []
      const actualSelectedAlgorithm: AssetExtended | undefined = isAlgorithmFlow
        ? asset
        : selectedAlgorithmAsset

      if (isAlgorithmFlow) {
        actualSelectedDataset = selectedDatasetAsset || []
      } else {
        actualSelectedDataset = [asset]
        if (!actualSelectedAlgorithm) {
          toast.error('Please select an algorithm before continuing.')
          return
        }
      }

      const groupedParams = values?.updatedGroupedUserParameters
      const algoServiceParams: Record<string, ParamValue> = {}
      if (groupedParams?.algoParams?.length > 0) {
        groupedParams.algoParams.forEach((algoEntry) => {
          algoEntry.userParameters?.forEach((param: UserParameter) => {
            algoServiceParams[param.name] = param.value ?? param.default ?? ''
          })
        })
      }

      const datasetParamsPayload:
        | Record<string, ParamValue>[]
        | Record<string, ParamValue> = isAlgorithmFlow ? [] : {}

      if (groupedParams?.datasetParams?.length > 0) {
        if (isAlgorithmFlow) {
          actualSelectedDataset.forEach((_, i) => {
            const datasetEntry = groupedParams.datasetParams[i]
            const datasetParamObj: Record<string, ParamValue> = {}
            datasetEntry?.userParameters?.forEach((param: UserParameter) => {
              datasetParamObj[param.name] = param.value ?? param.default ?? ''
            })
            ;(datasetParamsPayload as Record<string, ParamValue>[]).push(
              datasetParamObj
            )
          })
        } else {
          const datasetEntry = groupedParams.datasetParams[0]
          datasetEntry?.userParameters?.forEach((param: UserParameter) => {
            ;(datasetParamsPayload as Record<string, ParamValue>)[param.name] =
              param.value ?? param.default ?? ''
          })
        }
      }

      const userCustomParameters = {
        dataServiceParams: datasetParamsPayload,
        algoServiceParams
      }

      const datasetServices = isAlgorithmFlow
        ? getSelectedDatasetServices(values)
        : actualSelectedDataset.map((ds, i) => {
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

      await startJob(userCustomParameters, datasetServices, values)
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

  async function handleInitCompute(formikValues: FormComputeData) {
    const datasetServices = isAlgorithmFlow
      ? getSelectedDatasetServices(formikValues)
      : [{ asset, service }]

    if (
      isAlgorithmFlow &&
      !datasetServices.length &&
      !formikValues?.withoutDataset
    ) {
      toast.error('Please select at least one dataset before calculating fees.')
      return
    }

    try {
      await initPriceAndFees(datasetServices, formikValues, false)
      toast.info('Compute provider initialized successfully.')
    } catch (err) {
      const message =
        (err as Error)?.message || 'Failed to initialize provider.'
      toast.error(message)
    }
  }

  if (!asset) {
    return null
  }

  if (isLoading) {
    return <LoadingState containerClassName={styles.container} />
  }

  if (error) {
    return (
      <ErrorState
        containerClassName={styles.container}
        errorClassName={styles.error}
        message={error}
      />
    )
  }

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        await onSubmit(values)
      }}
    >
      {(formikContext) => {
        const { values, setFieldValue } = formikContext

        const hasUserParamsStep = Boolean(values.isUserParameters)
        const computeStep = hasUserParamsStep ? 5 : 4
        const hasMissingRequiredDefaults =
          Array.isArray(values.userUpdatedParameters) &&
          values.userUpdatedParameters.some((entry) =>
            entry.userParameters?.some(
              (param) =>
                param.required &&
                (param.default === null ||
                  param.default === undefined ||
                  param.default === '' ||
                  param.value === null ||
                  param.value === undefined ||
                  param.value === '')
            )
          )

        const isContinueDisabled = isAlgorithmFlow
          ? (values.user.stepCurrent === 1 &&
              !(values.datasets?.length > 0 || values.withoutDataset)) ||
            (values.user.stepCurrent === 2 &&
              !(values.serviceSelected || values.withoutDataset)) ||
            (values.user.stepCurrent === computeStep && !values.computeEnv) ||
            (values.user.stepCurrent === 4 && hasMissingRequiredDefaults)
          : (values.user.stepCurrent === 1 && !values.algorithm) ||
            (values.user.stepCurrent === computeStep && !values.computeEnv) ||
            (values.user.stepCurrent === 2 && !values.serviceSelected) ||
            (values.user.stepCurrent === 4 && hasMissingRequiredDefaults)

        const selectedAlgoAssetForDisplay = isAlgorithmFlow
          ? asset
          : selectedAlgorithmAsset
        const algorithmAssetChainId =
          selectedAlgoAssetForDisplay?.credentialSubject?.chainId
        const algorithmSymbol =
          selectedAlgoAssetForDisplay?.accessDetails?.[svcIndex]?.baseToken
            ?.symbol || (algorithmAssetChainId === 137 ? 'mOCEAN' : 'OCEAN')
        const dtSymbolSelectedComputeAsset =
          selectedAlgoAssetForDisplay?.accessDetails?.[svcIndex]?.datatoken
            ?.symbol
        const selectedComputeAssetTimeout = secondsToString(
          selectedAlgoAssetForDisplay?.credentialSubject?.services?.[svcIndex]
            ?.timeout
        )
        const providerSymbolForDisplay = isAlgorithmFlow
          ? providerFeesSymbol
          : 'OCEAN'

        return (
          <div className={styles.containerOuter}>
            <Title flow={flow} asset={asset} service={service} />
            <Form className={styles.form}>
              <Navigation flow={flow} />
              <SectionContainer className={styles.container}>
                {showSuccess ? (
                  <SuccessState
                    jobId={successJobId}
                    onContinue={() => {
                      setShowSuccess(false)
                      resetCacheWallet()
                      onClose?.()
                    }}
                    containerClassName={styles.successContent}
                    detailsClassName={styles.successDetails}
                    jobIdContainerClassName={styles.jobIdContainer}
                  />
                ) : (
                  <CredentialDialogProvider>
                    <Steps
                      flow={flow}
                      asset={asset}
                      service={service}
                      signer={signer}
                      accessDetails={accessDetails}
                      datasets={datasetList}
                      algorithms={algorithmList}
                      ddoListAlgorithms={ddoAlgorithmList}
                      selectedAlgorithmAsset={selectedAlgorithmAsset}
                      setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
                      selectedDatasetAsset={
                        isAlgorithmFlow ? selectedDatasetAsset : undefined
                      }
                      setSelectedDatasetAsset={
                        isAlgorithmFlow ? setSelectedDatasetAsset : undefined
                      }
                      isLoading={isOrdering || isSubmittingJob}
                      isComputeButtonDisabled={isComputeButtonDisabled}
                      hasPreviousOrder={!!validOrderTx}
                      hasDatatoken={hasDatatoken}
                      dtBalance={dtBalance}
                      assetTimeout={secondsToString(service.timeout)}
                      hasPreviousOrderSelectedComputeAsset={
                        isAlgorithmFlow ? !!validAlgorithmOrderTx : false
                      }
                      hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                      isAccountIdWhitelisted={isAccountIdWhitelisted}
                      algorithmSymbol={algorithmSymbol}
                      providerFeesSymbol={providerSymbolForDisplay}
                      dtSymbolSelectedComputeAsset={
                        dtSymbolSelectedComputeAsset
                      }
                      dtBalanceSelectedComputeAsset={algorithmDTBalance}
                      selectedComputeAssetType="algorithm"
                      selectedComputeAssetTimeout={selectedComputeAssetTimeout}
                      allResourceValues={allResourceValues}
                      setAllResourceValues={setAllResourceValues}
                      stepText={computeStatusText}
                      isConsumable={isConsumablePrice}
                      consumableFeedback={consumableFeedback}
                      datasetOrderPriceAndFees={datasetOrderPriceAndFees}
                      algoOrderPriceAndFees={algoOrderPriceAndFees}
                      retry={retry}
                      onRunInitPriceAndFees={async () => {
                        await initPriceAndFees(undefined, values, false)
                      }}
                      onCheckAlgoDTBalance={
                        isAlgorithmFlow
                          ? undefined
                          : () => checkAssetDTBalance(selectedAlgorithmAsset)
                      }
                      computeEnvs={computeEnvs}
                      jobs={jobs}
                      isLoadingJobs={isLoadingJobs}
                      refetchJobs={() => refetchComputeJobs('init')}
                      formikValues={values}
                      setFieldValue={setFieldValue}
                      datasetProviderFeeProp={datasetProviderFee}
                      algorithmProviderFeeProp={algorithmProviderFee}
                      isBalanceSufficient={isBalanceSufficient}
                      setIsBalanceSufficient={setIsBalanceSufficient}
                    />
                  </CredentialDialogProvider>
                )}

                {!showSuccess && (
                  <WizardActions
                    submitButtonText="Buy Compute Job"
                    rightAlignFirstStep={false}
                    isContinueDisabled={isContinueDisabled}
                    isSubmitDisabled={isComputeButtonDisabled}
                    action="compute"
                    disabled={
                      isComputeButtonDisabled ||
                      !isAssetNetwork ||
                      !isAccountIdWhitelisted ||
                      !isBalanceSufficient
                    }
                    hasPreviousOrder={!!validOrderTx}
                    hasDatatoken={hasDatatoken}
                    btSymbol={accessDetails.baseToken?.symbol}
                    dtSymbol={accessDetails.datatoken?.symbol}
                    dtBalance={dtBalance}
                    assetTimeout={secondsToString(service.timeout)}
                    assetType={asset.credentialSubject?.metadata.type}
                    hasPreviousOrderSelectedComputeAsset={
                      !!validAlgorithmOrderTx
                    }
                    hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                    dtSymbolSelectedComputeAsset={dtSymbolSelectedComputeAsset}
                    dtBalanceSelectedComputeAsset={algorithmDTBalance}
                    selectedComputeAssetType="algorithm"
                    stepText={computeStatusText}
                    isLoading={isOrdering || isSubmittingJob}
                    type="submit"
                    priceType={accessDetails.type}
                    algorithmPriceType={asset?.accessDetails?.[0]?.type}
                    isBalanceSufficient={isBalanceSufficient}
                    isConsumable={isConsumablePrice}
                    consumableFeedback={consumableFeedback}
                    isAlgorithmConsumable={isAlgorithmConsumable}
                    isSupportedOceanNetwork={isSupportedOceanNetwork}
                    retry={retry}
                    isAccountConnected={isConnected}
                    computeWizard
                    extraFeesLoaded={extraFeesLoaded}
                    isInitLoading={isInitLoading}
                    onInitCompute={() => handleInitCompute(values)}
                  />
                )}
              </SectionContainer>
            </Form>
          </div>
        )
      }}
    </Formik>
  )
}
