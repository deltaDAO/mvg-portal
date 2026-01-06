import { useEffect, useRef, useState, ReactElement } from 'react'
import { useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
import styles from './index.module.css'
import { Asset } from 'src/@types/Asset'
import { ComputeFlow } from '../_types'
import { getOceanConfig } from '@utils/ocean'
import { getDummySigner, getTokenInfo } from '@utils/wallet'
import LoaderOverlay from '../LoaderOverlay'
import External from '@images/external.svg'
import { CopyToClipboard } from '@shared/CopyToClipboard'

type DatasetService = {
  id?: string
  serviceId?: string
  serviceName?: string
  serviceDescription?: string
  serviceDuration?: string | number
  serviceType?: string
  price?: number | string
  tokenSymbol?: string
  checked?: boolean
  userParameters?: any[]
}

type DatasetItem = {
  did: string
  name: string
  expanded?: boolean
  checked?: boolean
  services?: DatasetService[]
  datasetPrice?: number
}

type NormalizedService = {
  id: string
  title: string
  name: string
  description: string
  type: string
  duration: number
  price: number
  symbol: string
  checked: boolean
  userParameters?: unknown[]
}

type NormalizedAsset = {
  id: string
  name: string
  expanded: boolean
  checked: boolean | undefined
  services: NormalizedService[]
}

type DatasetFlowValues = {
  algorithm?: string
  algorithms?: AlgorithmFormState
  serviceSelected?: boolean
}

type AlgorithmFlowValues = {
  datasets?: DatasetItem[]
  dataset?: string[]
  serviceSelected?: boolean
}

type FormValues = DatasetFlowValues &
  AlgorithmFlowValues & {
    algorithmServiceParams?: Array<{
      did: string
      serviceId: string
      userParameters?: unknown[]
    }>
    isUserParameters?: boolean
  }

type AlgorithmServiceForm = {
  id: string
  name: string
  title: string
  serviceDescription?: string
  type: string
  duration: number
  price: number
  symbol: string
  checked?: boolean
  userParameters?: unknown[]
}

type AlgorithmFormState = {
  id: string
  name: string
  description?: string
  expanded?: boolean
  checked?: boolean
  services?: AlgorithmServiceForm[]
}

type AlgorithmSelectionValue = {
  algoDid?: string
  serviceId?: string
}

type AlgorithmSelectionInput =
  | string
  | AlgorithmSelectionValue
  | AlgorithmSelectionValue[]

function parseAlgorithmSelection(value: AlgorithmSelectionInput): {
  algorithmId: string | null
  serviceId: string | null
} {
  if (Array.isArray(value)) {
    return parseAlgorithmSelection(
      (value[0] ?? null) as AlgorithmSelectionInput
    )
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as AlgorithmSelectionValue
      return {
        algorithmId: parsed?.algoDid ?? null,
        serviceId: parsed?.serviceId ?? null
      }
    } catch {
      return { algorithmId: value, serviceId: null }
    }
  }

  if (value && typeof value === 'object') {
    const parsed = value as AlgorithmSelectionValue
    return {
      algorithmId: parsed.algoDid ?? null,
      serviceId: parsed.serviceId ?? null
    }
  }

  return { algorithmId: null, serviceId: null }
}

function normalizeDatasets(raw: DatasetItem[] = []): NormalizedAsset[] {
  const onlyOneDataset = raw.length === 1
  return raw.map((d) => {
    const services = (d.services ?? []).map((s) => ({
      id: s.serviceId,
      title: s.serviceName,
      name: s.serviceName,
      description: s.serviceDescription || 'No description',
      type: s.serviceType,
      duration: Number(s.serviceDuration ?? 0),
      price: Number(s.price ?? d.datasetPrice ?? 0),
      symbol: s.tokenSymbol || 'OCEAN',
      checked: !!s.checked
    }))
    if (onlyOneDataset && services.length === 1 && !services[0].checked) {
      services[0].checked = true
    }
    const all = services.every((s) => s.checked)
    const some = services.some((s) => s.checked)
    return {
      id: d.did,
      name: d.name,
      expanded: d.expanded ?? false,
      checked: all ? true : some ? undefined : false,
      services
    }
  })
}

const extractString = (
  value: string | { '@value': string } | undefined
): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && '@value' in value)
    return value['@value']
  return ''
}

const anyServiceSelected = (assets: NormalizedAsset[]) =>
  assets.some((a) => a.services.some((s) => s.checked))

const toggleExpand = (assets: NormalizedAsset[], id: string) =>
  assets.map((a) => (a.id === id ? { ...a, expanded: !a.expanded } : a))

const toggleAsset = (assets: NormalizedAsset[], id: string) =>
  assets.map((a) => {
    if (a.id !== id) return a
    const newChecked = !a.checked
    return {
      ...a,
      checked: newChecked,
      services: a.services.map((s) => ({ ...s, checked: newChecked }))
    }
  })

const toggleService = (
  assets: NormalizedAsset[],
  assetId: string,
  serviceId: string,
  singleSelection: boolean
) =>
  assets.map((a) => {
    if (a.id !== assetId) return a
    const services = a.services.map((s) => {
      if (s.id !== serviceId)
        return singleSelection ? { ...s, checked: false } : s
      return { ...s, checked: singleSelection ? true : !s.checked }
    })
    const all = services.every((s) => s.checked)
    const some = services.some((s) => s.checked)
    return { ...a, services, checked: all ? true : some ? undefined : false }
  })

function Row({
  asset,
  onToggleAsset,
  onToggleExpand,
  isDatasetFlow
}: {
  asset: NormalizedAsset
  onToggleAsset: (id: string) => void
  onToggleExpand: (id: string) => void
  isDatasetFlow: boolean
}) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = asset.checked === undefined
    }
  }, [asset.checked])

  return (
    <div className={styles.serviceRow}>
      {isDatasetFlow ? (
        <div className={styles.checkboxColumn} />
      ) : (
        <div className={styles.checkboxColumn}>
          <input
            ref={checkboxRef}
            type="checkbox"
            className={styles.checkboxInput}
            checked={asset.checked === true}
            onChange={() => onToggleAsset(asset.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {isDatasetFlow ? (
        <></>
      ) : (
        <div
          className={styles.expandCollapseIcon}
          onClick={() => onToggleExpand(asset.id)}
        >
          {asset.expanded ? (
            <MinimizeIcon className={styles.expandedIcon} />
          ) : (
            <ExpandIcon />
          )}
        </div>
      )}

      <div
        className={styles.serviceName}
        onClick={() => (isDatasetFlow ? undefined : onToggleExpand(asset.id))}
      >
        {asset.name}
        <a
          className={styles.externalLink}
          href={`/asset/${encodeURIComponent(asset.id)}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <External />
        </a>
      </div>

      <div className={styles.titleColumn} />
      <div className={styles.descriptionColumn} />
      <div className={styles.typeColumn} />
      <div className={styles.durationColumn} />
      <div className={styles.priceColumn} />
    </div>
  )
}

function List({
  title,
  assets,
  onToggleAsset,
  onToggleService,
  onToggleExpand,
  isDatasetFlow,
  isLoading
}: {
  title: string
  assets: NormalizedAsset[]
  onToggleAsset: (id: string) => void
  onToggleService: (assetId: string, serviceId: string) => void
  onToggleExpand: (id: string) => void
  isDatasetFlow: boolean
  isLoading?: boolean
}): ReactElement {
  const headerTitle = title
  const servicesColumnTitle = isDatasetFlow ? 'SERVICE' : 'SERVICES'
  const skeletonItems = Array.from({ length: 3 })

  return (
    <div className={styles.container}>
      {isDatasetFlow ? (
        <StepTitle title={headerTitle} />
      ) : (
        <h1 className={styles.title}>{headerTitle}</h1>
      )}
      <div className={styles.boxModel}>
        <div className={styles.headerWrapper}>
          <div className={styles.header}>
            <div className={styles.checkboxColumn} />
            <div className={styles.servicesColumn}>{servicesColumnTitle}</div>
            <div className={styles.titleColumn}>TITLE</div>
            <div className={styles.descriptionColumn}>DESCRIPTION</div>
            <div className={styles.typeColumn}>TYPE</div>
            <div className={styles.durationColumn}>DURATION</div>
            <div className={styles.priceColumn}>PRICE</div>
          </div>
        </div>

        {isLoading
          ? skeletonItems.map((_, idx) => (
              <div key={`skeleton-${idx}`} className={styles.skeletonRow}>
                <div className={styles.checkboxColumn}>
                  <div className={styles.skeletonBox} />
                </div>
                <div className={styles.servicesColumn}>
                  <div
                    className={`${styles.skeletonBox} ${styles.skeletonWide}`}
                  />
                </div>
                <div className={styles.titleColumn}>
                  <div className={styles.skeletonBox} />
                </div>
                <div className={styles.descriptionColumn}>
                  <div
                    className={`${styles.skeletonBox} ${styles.skeletonWide}`}
                  />
                </div>
                <div className={styles.typeColumn}>
                  <div
                    className={`${styles.skeletonBox} ${styles.skeletonNarrow}`}
                  />
                </div>
                <div className={styles.durationColumn}>
                  <div
                    className={`${styles.skeletonBox} ${styles.skeletonNarrow}`}
                  />
                </div>
                <div className={styles.priceColumn}>
                  <div className={styles.skeletonBox} />
                </div>
              </div>
            ))
          : assets.map((asset) => (
              <div key={asset.id} className={styles.dataset}>
                <Row
                  asset={asset}
                  onToggleAsset={onToggleAsset}
                  onToggleExpand={onToggleExpand}
                  isDatasetFlow={isDatasetFlow}
                />

                {asset.expanded && (
                  <div className={styles.servicesContainer}>
                    {asset.services.map((service) => (
                      <div key={service.id} className={styles.service}>
                        <div className={styles.checkboxColumn}>
                          <input
                            type="checkbox"
                            className={styles.checkboxInput}
                            checked={service.checked || false}
                            onChange={() =>
                              onToggleService(asset.id, service.id)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className={styles.servicesColumn}>
                          <CopyToClipboard
                            value={asset.id}
                            truncate={8}
                            className={styles.copyWrapper}
                            textClassName={styles.didButton}
                            showCopyButton={false}
                          />
                        </div>
                        <div className={styles.titleColumn}>
                          <span className={styles.titleText}>
                            {service.title}
                          </span>
                        </div>
                        <div className={styles.descriptionColumn}>
                          <span className={styles.descriptionText}>
                            {service.description || ''}
                          </span>
                        </div>
                        <div className={styles.typeColumn}>{service.type}</div>
                        <div className={styles.durationColumn}>
                          {Number(service.duration) === 0 ||
                          Number.isNaN(Number(service.duration))
                            ? 'Forever'
                            : `${Math.floor(
                                Number(service.duration) / (60 * 60 * 24)
                              )} days`}
                        </div>
                        <div className={styles.priceColumn}>
                          {service.price}{' '}
                          <span className={styles.symbol}>
                            {service.symbol}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  )
}

export default function SelectServicesStep({
  flow,
  ddoListAlgorithms = []
}: {
  flow: ComputeFlow
  ddoListAlgorithms?: Asset[]
}): ReactElement {
  const isDatasetFlow = flow === 'dataset'
  const singleSelection = isDatasetFlow
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [assets, setAssets] = useState<NormalizedAsset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const loadingStartRef = useRef<number>(0)
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const MIN_LOADING_DURATION_MS = 1000

  useEffect(
    () => () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current)
      }
    },
    []
  )
  // dataset flow: fetch algorithm + single service
  useEffect(() => {
    if (!isDatasetFlow) return
    if (!values.algorithm) {
      setAssets([])
      setFieldValue('serviceSelected', false)
      return
    }
    setAssets([])
    setFieldValue('serviceSelected', false)

    const fetchAlgorithm = async () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current)
      loadingStartRef.current = Date.now()
      setIsLoading(true)
      try {
        const { algorithmId, serviceId } = parseAlgorithmSelection(
          values.algorithm as AlgorithmSelectionInput
        )
        if (!algorithmId) return
        const assetDdo =
          ddoListAlgorithms.find((ddo) => ddo.id === algorithmId) || null
        if (!assetDdo) return

        const effectiveServices = assetDdo.credentialSubject?.services || []
        if (!effectiveServices.length) return

        const chainId = assetDdo.credentialSubject?.chainId
        if (!chainId) return

        const { oceanTokenAddress } = getOceanConfig(chainId)
        const signer = await getDummySigner(chainId)
        const tokenDetails = await getTokenInfo(
          oceanTokenAddress,
          signer.provider
        )

        const existingSelectedServiceId =
          (values.algorithms as any)?.id === algorithmId
            ? (values.algorithms as any)?.services?.find((s: any) => s.checked)
                ?.id
            : null

        const normalizedServices = effectiveServices.map((svc, idx) => ({
          id: svc.id,
          title: extractString(svc.name) || svc.type,
          name: extractString(svc.name) || svc.type,
          description:
            extractString(svc.description) || `Service for ${svc.type}`,
          type: svc.type,
          duration: Number(svc.timeout ?? 0),
          price: Number(assetDdo.indexedMetadata.stats[idx]?.prices[0]?.price),
          symbol: tokenDetails.symbol,
          checked:
            existingSelectedServiceId != null
              ? svc.id === existingSelectedServiceId
              : serviceId != null
              ? svc.id === serviceId
              : idx === 0,
          userParameters: svc.consumerParameters
        }))

        const normalized: NormalizedAsset = {
          id: assetDdo.id,
          name:
            extractString(assetDdo.credentialSubject?.metadata?.name) ||
            'Selected Algorithm',
          expanded: true,
          checked: true,
          services: normalizedServices
        }

        setAssets([normalized])
        setFieldValue('algorithms', {
          id: assetDdo.id,
          name: normalized.name,
          description:
            extractString(assetDdo.credentialSubject?.metadata?.description) ||
            'Algorithm service',
          expanded: true,
          checked: true,
          services: normalizedServices.map((svc) => ({
            id: svc.id,
            name: svc.name,
            title: svc.title,
            serviceDescription: svc.description,
            type: svc.type,
            duration: svc.duration,
            price: svc.price,
            symbol: svc.symbol,
            checked: svc.checked,
            userParameters: svc.userParameters
          }))
        })
        setFieldValue('serviceSelected', true)

        const selectedService = normalizedServices.find((s) => s.checked)
        const hasUserParams = !!(
          selectedService?.userParameters &&
          selectedService.userParameters.length > 0
        )
        setFieldValue('isUserParameters', hasUserParams)
      } finally {
        const elapsed = Date.now() - loadingStartRef.current
        const remaining = Math.max(0, MIN_LOADING_DURATION_MS - elapsed)
        loadingTimerRef.current = setTimeout(() => {
          setIsLoading(false)
        }, remaining)
      }
    }

    fetchAlgorithm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDatasetFlow, values.algorithm, ddoListAlgorithms, setFieldValue])

  // algorithm flow: normalize datasets
  useEffect(() => {
    if (isDatasetFlow) return
    if (!values.datasets) return
    setAssets(normalizeDatasets(values.datasets))
  }, [isDatasetFlow, values.datasets])

  // sync selected services back into form values for algorithm flow (needed by preview)
  useEffect(() => {
    if (isDatasetFlow) return
    if (!values.datasets || values.datasets.length === 0) return

    const updatedDatasets = values.datasets.map((dataset) => {
      const match = assets.find((a) => a.id === dataset.did)
      if (!match) return dataset
      return {
        ...dataset,
        services: (dataset.services || []).map((svc) => {
          const svcId =
            svc.serviceId || (typeof svc.id === 'string' ? svc.id : undefined)
          const normalized = match.services.find((s) => s.id === svcId)
          if (!normalized) return svc
          return {
            ...svc,
            checked: normalized.checked
          }
        })
      }
    })

    const hasChanged =
      JSON.stringify(updatedDatasets) !== JSON.stringify(values.datasets)
    if (hasChanged) {
      setFieldValue('datasets', updatedDatasets)
    }

    const anyDatasetServiceHasUserParams = updatedDatasets.some((dataset) =>
      (dataset.services || []).some(
        (svc) =>
          svc.checked && svc.userParameters && svc.userParameters.length > 0
      )
    )
    const hasAlgoParams = !!(
      values.algorithmServiceParams && values.algorithmServiceParams.length > 0
    )
    const shouldSetUserParams = hasAlgoParams || anyDatasetServiceHasUserParams

    if (values.isUserParameters !== shouldSetUserParams) {
      setFieldValue('isUserParameters', shouldSetUserParams)
    }
  }, [
    assets,
    isDatasetFlow,
    setFieldValue,
    values.datasets,
    values.algorithmServiceParams,
    values.isUserParameters
  ])

  // sync serviceSelected and isUserParameters for dataset flow
  useEffect(() => {
    setFieldValue('serviceSelected', anyServiceSelected(assets))

    if (!isDatasetFlow || assets.length === 0) return

    const [algoAsset] = assets
    const updatedServices = algoAsset.services.map((svc) => ({
      id: svc.id,
      name: svc.name,
      title: svc.title,
      serviceDescription: svc.description,
      type: svc.type,
      duration: svc.duration,
      price: svc.price,
      symbol: svc.symbol,
      checked: svc.checked,
      userParameters: svc.userParameters
    }))

    const selectedService = updatedServices.find((s) => s.checked)
    const hasUserParams = Boolean(
      selectedService?.userParameters &&
        selectedService.userParameters.length > 0
    )
    setFieldValue('isUserParameters', hasUserParams)

    const updatedAlgorithm = {
      ...(values.algorithms || {}),
      id: algoAsset.id,
      name: values.algorithms?.name ?? algoAsset.name,
      description: values.algorithms?.description,
      expanded: true,
      checked: true,
      services: updatedServices
    }

    if (
      JSON.stringify(values.algorithms) !== JSON.stringify(updatedAlgorithm)
    ) {
      setFieldValue('algorithms', updatedAlgorithm)
    }

    if (selectedService?.id) {
      const encodedSelection = JSON.stringify({
        algoDid: algoAsset.id,
        serviceId: selectedService.id
      })
      const currentSelection =
        typeof values.algorithm === 'string' ? values.algorithm : ''
      if (currentSelection !== encodedSelection) {
        setFieldValue('algorithm', encodedSelection)
      }
    }
  }, [
    assets,
    setFieldValue,
    isDatasetFlow,
    values.algorithms,
    values.algorithm
  ])

  const handleToggleExpand = (id: string) =>
    setAssets((prev) => toggleExpand(prev, id))
  const handleToggleAsset = (id: string) =>
    setAssets((prev) => toggleAsset(prev, id))
  const handleToggleService = (assetId: string, serviceId: string) =>
    setAssets((prev) =>
      toggleService(prev, assetId, serviceId, singleSelection)
    )

  if (isDatasetFlow && assets.length === 0 && !isLoading) {
    return (
      <div className={styles.container}>
        <StepTitle title="Select Algorithm Service" />
        <p>Please select an algorithm first</p>
      </div>
    )
  }

  return (
    <div className={styles.listWrapper}>
      <List
        title={isDatasetFlow ? 'Select Algorithm Service' : 'Select Services'}
        assets={assets}
        onToggleAsset={handleToggleAsset}
        onToggleService={handleToggleService}
        onToggleExpand={handleToggleExpand}
        isDatasetFlow={isDatasetFlow}
        isLoading={isLoading}
      />
      <LoaderOverlay
        visible={isLoading}
        message={isDatasetFlow ? 'Loading services...' : 'Loading services...'}
      />
    </div>
  )
}
