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
  ProviderFees,
  UserCustomParameters,
  EscrowContract
} from '@oceanprotocol/lib'
import { toast } from 'react-toastify'
import Alert from '@shared/atoms/Alert'
import { Formik, Form } from 'formik'
import Button from '@shared/atoms/Button'
import { initialValues, algorithmSteps, datasetSteps } from './_constants'
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
import { getOrderPriceAndFees } from '@utils/accessDetailsAndPricing'
import { getComputeFeedback } from '@utils/feedback'
import {
  initializeProviderForComputeMulti,
  getComputeEnvironments
} from '@utils/provider'
import { useUserPreferences } from '@context/UserPreferences'
import { getDummySigner } from '@utils/wallet'
import { parseConsumerParameterValues } from '../Asset/AssetActions/ConsumerParameters'
import { ethers, Signer } from 'ethers'
import { useAccount } from 'wagmi'
import { Asset } from 'src/@types/Asset'
import { useSsiWallet } from '@context/SsiWallet'
import { oceanTokenAddress } from 'app.config.cjs'
import { ResourceType } from 'src/@types/ResourceType'
import { handleComputeOrder } from '@utils/order'

import { PolicyServerInitiateComputeActionData } from 'src/@types/PolicyServer'
// import FormStartComputeAlgo from './FormComputeAlgorithm'
import { getAlgorithmDatasetsForCompute } from '@utils/aquarius'

import Title from './Title'
import WizardActions from '@shared/WizardActions'
import Navigation from './Navigation'
import Steps from './Steps'
import { validationSchema } from './_validation'
import SectionContainer from '../@shared/SectionContainer/SectionContainer'
import { AssetExtended } from 'src/@types/AssetExtended'
// import { AssetExtended } from '../../../../@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'
import Loader from '@shared/atoms/Loader'
import { FormComputeData } from './_types'
import { CredentialDialogProvider } from '../Asset/AssetActions/Compute/CredentialDialogProvider'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useAsset } from '@context/Asset'

export default function ComputeWizard({
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
  onComputeJobCreated
}: {
  accountId: string
  signer: Signer
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  dtBalance: string
  file: FileInfo
  isAccountIdWhitelisted: boolean
  consumableFeedback?: string
  onClick?: () => void
  onClose?: () => void
  onComputeJobCreated?: () => void
}): ReactElement {
  useUserPreferences()
  const { isAssetNetwork } = useAsset()
  const { isConnected } = useAccount()
  const newCancelToken = useCancelToken()
  const { isSupportedOceanNetwork } = useNetworkMetadata()

  const [isLoading, setIsLoading] = useState(true)
  const isAlgorithm = asset?.credentialSubject.metadata.type === 'algorithm'
  const steps = isAlgorithm ? algorithmSteps : datasetSteps
  const totalSteps = steps.length

  // copied from compute
  const { address } = useAccount()
  const { chainIds } = useUserPreferences()

  const [isOrdering, setIsOrdering] = useState(false)
  const [error, setError] = useState<string>()
  const [showSuccess, setShowSuccess] = useState(false)
  const [successJobId, setSuccessJobId] = useState<string>()

  const [algorithmList, setAlgorithmList] = useState<AssetSelectionAsset[]>()
  const [datasetList, setDatasetList] = useState<AssetSelectionAsset[]>()

  const [ddoAlgorithmList, setDdoAlgorithmList] = useState<Asset[]>()
  const [selectedAlgorithmAsset, setSelectedAlgorithmAsset] =
    useState<AssetExtended>()
  const [hasAlgoAssetDatatoken, setHasAlgoAssetDatatoken] = useState<boolean>()
  const [algorithmDTBalance, setAlgorithmDTBalance] = useState<string>()
  const [validAlgorithmOrderTx] = useState('')

  const [validOrderTx, setValidOrderTx] = useState('')

  const [isConsumablePrice, setIsConsumablePrice] = useState(true)
  const [computeStatusText, setComputeStatusText] = useState('')
  const [computeEnvs, setComputeEnvs] = useState<ComputeEnvironment[]>()
  const [initializedProviderResponse, setInitializedProviderResponse] =
    useState<ProviderComputeInitializeResults>()
  const [datasetOrderPriceAndFees, setDatasetOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [algoOrderPriceAndFees, setAlgoOrderPriceAndFees] =
    useState<OrderPriceAndFees>()
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [retry, setRetry] = useState<boolean>(false)
  const {
    lookupVerifierSessionId,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
  } = useSsiWallet()

  const [svcIndex, setSvcIndex] = useState(0)

  const [allResourceValues, setAllResourceValues] = useState<{
    [envId: string]: ResourceType
  }>({})

  const getSelectedComputeEnvAndResources = (
    formikValues: FormComputeData | Record<string, never>
  ) => {
    const selectedEnvId = (formikValues as FormComputeData)?.computeEnv?.id
    const selectedComputeEnv = computeEnvs?.find(
      (env) => env.id === selectedEnvId
    )
    const selectedResources = selectedEnvId
      ? (() => {
          const freeResources = allResourceValues[`${selectedEnvId}_free`]
          const paidResources = allResourceValues[`${selectedEnvId}_paid`]

          const mode = (formikValues as FormComputeData)?.mode || 'free'

          if (mode === 'paid' && paidResources) {
            return paidResources
          } else if (mode === 'free' && freeResources) {
            return freeResources
          }

          if (
            paidResources &&
            (paidResources.cpu > 0 ||
              paidResources.ram > 0 ||
              paidResources.disk > 0)
          ) {
            return paidResources
          } else if (freeResources) {
            return freeResources
          }
          return undefined
        })()
      : undefined

    return { selectedComputeEnv, selectedResources }
  }

  const hasDatatoken = Number(dtBalance) >= 1
  const isComputeButtonDisabled =
    isOrdering === true ||
    file === null ||
    (!validOrderTx && !hasDatatoken && !isConsumablePrice)

  const isUnsupportedPricing = accessDetails?.type === 'NOT_SUPPORTED'

  function resetCacheWallet() {
    ssiWalletCache.clearCredentials()
    setCachedCredentials([])
    clearVerifierSessionCache()
    try {
      let removed = 0
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith('credential_')) {
          localStorage.removeItem(key)
          removed++
        }
      }
    } catch {}
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
    formikValues?: FormComputeData
  ) {
    try {
      const { selectedComputeEnv, selectedResources } =
        getSelectedComputeEnvAndResources(formikValues || {})

      if (!selectedComputeEnv || !selectedComputeEnv.id || !selectedResources)
        throw new Error(`Error getting compute environment!`)

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

      const datasetsForProvider = (datasetServices || []).map(
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

      const initializedProvider = await initializeProviderForComputeMulti(
        datasetsForProvider,
        actualAlgorithmAsset,
        algoSessionId,
        signer,
        selectedComputeEnv,
        selectedResources,
        actualSvcIndex
      )

      if (!initializedProvider)
        throw new Error('Error initializing provider for compute job')
      console.log('initilize compute is passed')

      const datasetResponses = await Promise.all(
        datasetsForProvider.map(
          async ({ asset, service, accessDetails }, i) => {
            const datasetOrderPriceResponse = await setDatasetPrice(
              asset,
              service,
              accessDetails,
              initializedProvider.datasets?.[i]?.providerFee
            )
            if (selectedResources.mode === 'paid') {
              const escrow = new EscrowContract(
                ethers.utils.getAddress(
                  initializedProvider.payment.escrowAddress
                ),
                signer,
                asset.credentialSubject.chainId
              )

              const amountHuman = String(selectedResources.price) // ex. "4"
              const amountWei = ethers.utils.parseUnits(amountHuman, 18)

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

              const currentAllowanceWei = await erc20.allowance(
                owner,
                escrowAddress
              )
              if (currentAllowanceWei.lt(amountWei)) {
                console.log(`Approving ${amountHuman} OCEAN to escrow...`)
                const approveTx = await erc20.approve(escrowAddress, amountWei)
                await approveTx.wait()
                console.log(`Approved ${amountHuman} OCEAN`)
              } else {
                console.log(`Skip approve: allowance >= ${amountHuman} OCEAN`)
              }

              const funds = await escrow.getUserFunds(owner, oceanTokenAddress)
              const depositedWei = ethers.BigNumber.from(funds[0] ?? '0')

              if (depositedWei.lt(amountWei)) {
                console.log(`Depositing ${amountHuman} OCEAN to escrow...`)
                const depositTx = await escrow.deposit(
                  oceanTokenAddress,
                  amountHuman
                )
                await depositTx.wait()
                console.log(`Deposited ${amountHuman} OCEAN`)
              } else {
                console.log(
                  `Skip deposit: escrow funds >= ${amountHuman} OCEAN`
                )
              }

              // await escrow.verifyFundsForEscrowPayment(
              //   oceanTokenAddress,
              //   selectedComputeEnv.consumerAddress,
              //   await unitsToAmount(signer, oceanTokenAddress, amountToDeposit),
              //   initializedProvider.payment.amount.toString(),
              //   initializedProvider.payment.minLockSeconds.toString(),
              //   '10'
              // )
            }
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
      throw error
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
            console.log('algo list!!!!, ', algorithmSelectionList)
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
        // Only show loading on initial load, not during polling
        if (type === 'init') {
          setIsLoadingJobs(true)
        }
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

        if (type === 'init') {
          setIsLoadingJobs(false)
        }
      }
    },
    [address, accountId, asset, service, chainIds, newCancelToken]
  )

  useEffect(() => {
    fetchJobs('init')

    const refreshInterval = 10000
    const interval = setInterval(() => {
      fetchJobs('poll')
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    formikValues?: FormComputeData
  ): Promise<void> {
    try {
      setIsOrdering(true)
      setError(undefined)

      const { selectedComputeEnv, selectedResources } =
        getSelectedComputeEnvAndResources(formikValues || {})

      const {
        datasetResponses,
        actualAlgorithmAsset,
        actualAlgoService,
        actualAlgoAccessDetails,
        initializedProvider
      } = await initPriceAndFees(datasetServices, formikValues)

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
        lookupVerifierSessionId(
          datasetResponses[0].actualDatasetAsset.id,
          datasetResponses[0].actualDatasetService.id
        ),
        selectedComputeEnv.consumerAddress
      )
      if (!algorithmOrderTx) throw new Error('Failed to order algorithm.')

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
          selectedComputeEnv.consumerAddress
        )
        if (!datasetOrderTx)
          throw new Error(
            `Failed to order dataset ${ds.actualDatasetAsset.id}.`
          )

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
      let resourceRequests
      if (selectedResources.mode === 'free') {
        console.log('in free mode check')
        resourceRequests = selectedComputeEnv.resources.map((res) => ({
          id: res.id,
          amount: res.inUse
        }))
        console.log('resourceRequests ', resourceRequests)
      } else {
        console.log('in paid mode check')
        resourceRequests = selectedComputeEnv.resources.map((res) => ({
          id: res.id,
          amount: selectedResources[res.id] || res.min
        }))
      }

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
      if (selectedResources.mode === 'paid') {
        console.log('in paid mode buy')
        response = await ProviderInstance.computeStart(
          service.serviceEndpoint,
          signer,
          selectedComputeEnv.id,
          datasetInputs,
          { ...computeAlgorithm, transferTxId: algorithmOrderTx },
          selectedResources.jobDuration,
          oceanTokenAddress,
          resourceRequests,
          datasetResponses[0].actualDatasetAsset.credentialSubject.chainId,
          null,
          null,
          policiesServer
        )
      } else {
        console.log('in free mode buy 1')
        const algorithm: ComputeAlgorithm = {
          documentId: actualAlgorithmAsset.id,
          serviceId: actualAlgoService.id,
          meta: actualAlgorithmAsset.credentialSubject?.metadata
            ?.algorithm as any
        }
        console.log('algo for free ', algorithm)
        console.log('in free mode buy 2')
        response = await ProviderInstance.freeComputeStart(
          service.serviceEndpoint,
          signer,
          selectedComputeEnv.id,
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
      }

      if (!response)
        throw new Error(
          'Failed to start compute job, check console for more details.'
        )

      setRefetchJobs(!refetchJobs)
      setSuccessJobId(response?.jobId || response?.id || 'N/A')
      setShowSuccess(true)
      resetCacheWallet()
      // Trigger refetch of compute jobs on the asset page
      onComputeJobCreated?.()
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

  const onSubmit = async (values: FormComputeData) => {
    try {
      // SSI checks are handled explicitly in the Review step; do not re‑validate on submit.

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
        // No selectedDatasetAsset for dataset flow
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

      const datasetServices: { asset: AssetExtended; service: Service }[] =
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

  // copied from compute

  useEffect(() => {
    if (!asset || !accountId) return

    async function fetchData() {
      try {
        setIsLoading(true)
        setError(undefined)

        const computeService = asset.credentialSubject?.services?.find(
          (service) => service.type === 'compute'
        )

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
        setComputeEnvs(environments || [])
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
        await onSubmit(values)
      }}
    >
      {(formikContext) => (
        <div className={styles.containerOuter}>
          <Title asset={asset} service={service} />
          <Form className={styles.form}>
            <Navigation steps={steps} />
            <SectionContainer className={styles.container}>
              {showSuccess ? (
                <div className={styles.successContent}>
                  <SuccessConfetti success="Job Started Successfully!" />
                  <div className={styles.successDetails}>
                    <h3>Compute Job Started!</h3>
                    <p>
                      Your compute job is now running and processing your data.
                    </p>
                    {successJobId && successJobId !== 'N/A' && (
                      <div className={styles.jobIdContainer}>
                        <p>
                          <strong>Job ID:</strong> {successJobId}
                        </p>
                      </div>
                    )}
                    <p>
                      You can monitor the progress in your profile or on the
                      asset page.
                    </p>
                    <p>Please close this wizard to continue.</p>
                    <Button
                      style="gradient"
                      onClick={() => {
                        setShowSuccess(false)
                        resetCacheWallet()
                        // Close the modal
                        onClose?.()
                      }}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {service.type === 'compute' && (
                    <Alert
                      text={
                        "This algorithm has been set to private by the publisher and can't be downloaded. You can run it against any allowed datasets though!"
                      }
                      state="info"
                    />
                  )}
                  <CredentialDialogProvider>
                    <Steps
                      asset={asset}
                      service={service}
                      accessDetails={accessDetails}
                      datasets={datasetList}
                      algorithms={algorithmList}
                      ddoListAlgorithms={ddoAlgorithmList}
                      selectedAlgorithmAsset={selectedAlgorithmAsset}
                      setSelectedAlgorithmAsset={setSelectedAlgorithmAsset}
                      isLoading={isOrdering}
                      isComputeButtonDisabled={isComputeButtonDisabled}
                      hasPreviousOrder={!!validOrderTx}
                      hasDatatoken={hasDatatoken}
                      dtBalance={dtBalance}
                      assetTimeout={secondsToString(service.timeout)}
                      hasPreviousOrderSelectedComputeAsset={false}
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
                        (selectedAlgorithmAsset?.credentialSubject?.chainId ===
                        137
                          ? 'mOCEAN'
                          : 'OCEAN')
                      }
                      providerFeesSymbol="OCEAN"
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
                        await initPriceAndFees(undefined, formikContext.values)
                      }}
                      onCheckAlgoDTBalance={() =>
                        checkAssetDTBalance(selectedAlgorithmAsset)
                      }
                      computeEnvs={computeEnvs}
                      jobs={jobs}
                      isLoadingJobs={isLoadingJobs}
                      refetchJobs={() => setRefetchJobs(!refetchJobs)}
                      formikValues={formikContext.values}
                      setFieldValue={formikContext.setFieldValue}
                    />
                  </CredentialDialogProvider>
                  {/* <AlgorithmDatasetsListForCompute
                                  asset={asset}
                                  service={service}
                                  accessDetails={accessDetails}
                                /> */}
                </>
              )}

              {!showSuccess && (
                <WizardActions
                  totalSteps={totalSteps}
                  submitButtonText="Buy Compute Job"
                  showSuccessConfetti={false}
                  rightAlignFirstStep={false}
                  isContinueDisabled={
                    formikContext.values.user.stepCurrent === 1 &&
                    !formikContext.values.algorithm
                  }
                  isSubmitDisabled={isComputeButtonDisabled}
                  action="compute"
                  disabled={
                    isComputeButtonDisabled ||
                    !isAssetNetwork ||
                    !isAccountIdWhitelisted
                  }
                  hasPreviousOrder={!!validOrderTx}
                  hasDatatoken={hasDatatoken}
                  btSymbol={accessDetails.baseToken?.symbol}
                  dtSymbol={accessDetails.datatoken?.symbol}
                  dtBalance={dtBalance}
                  assetTimeout={secondsToString(service.timeout)}
                  assetType={asset.credentialSubject?.metadata.type}
                  hasPreviousOrderSelectedComputeAsset={!!validAlgorithmOrderTx}
                  hasDatatokenSelectedComputeAsset={hasAlgoAssetDatatoken}
                  dtSymbolSelectedComputeAsset={
                    selectedAlgorithmAsset?.accessDetails?.[svcIndex]?.datatoken
                      .symbol
                  }
                  dtBalanceSelectedComputeAsset={algorithmDTBalance}
                  selectedComputeAssetType="algorithm"
                  stepText={computeStatusText}
                  isLoading={isOrdering}
                  type="submit"
                  priceType={accessDetails.type}
                  algorithmPriceType={asset?.accessDetails?.[0]?.type}
                  // isBalanceSufficient={isBalanceSufficient}
                  isConsumable={isConsumablePrice}
                  consumableFeedback={consumableFeedback}
                  isAlgorithmConsumable={
                    asset?.accessDetails?.[0]?.isPurchasable
                  }
                  isSupportedOceanNetwork={isSupportedOceanNetwork}
                  retry={retry}
                  isAccountConnected={isConnected}
                  computeWizard={true}
                />
              )}
            </SectionContainer>
          </Form>
          {/* {debug && (
            <div>Debug: {JSON.stringify(formikContext.values, null, 2)}</div>
          )} */}
        </div>
      )}
    </Formik>
  )
}
