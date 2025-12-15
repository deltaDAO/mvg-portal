import { useEffect, useRef, useState, ReactElement } from 'react'
import { useFormikContext } from 'formik'
import StepTitle from '@shared/StepTitle'
import MinimizeIcon from '@images/minimize.svg'
import ExpandIcon from '@images/expand.svg'
import styles from './index.module.css'
import { Asset } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { ComputeFlow } from '../_types'
import { getOceanConfig } from '@utils/ocean'
import { getDummySigner, getTokenInfo } from '@utils/wallet'
import LoaderOverlay from '../LoaderOverlay'

type DatasetService = {
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
  algorithms?: Algorithm
  serviceSelected?: boolean
}

type AlgorithmFlowValues = {
  datasets?: DatasetItem[]
  dataset?: string[]
  serviceSelected?: boolean
}

type FormValues = DatasetFlowValues & AlgorithmFlowValues

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
  isAlgorithmLayout
}: {
  asset: NormalizedAsset
  onToggleAsset: (id: string) => void
  onToggleExpand: (id: string) => void
  isAlgorithmLayout: boolean
}) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = asset.checked === undefined
    }
  }, [asset.checked])

  return (
    <div
      className={isAlgorithmLayout ? styles.algorithmRow : styles.datasetRow}
    >
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

      <div
        className={
          isAlgorithmLayout ? styles.algorithmName : styles.datasetName
        }
        onClick={() => onToggleExpand(asset.id)}
      >
        {asset.name}
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
  isAlgorithmLayout,
  onToggleAsset,
  onToggleService,
  onToggleExpand
}: {
  title: string
  assets: NormalizedAsset[]
  isAlgorithmLayout: boolean
  onToggleAsset: (id: string) => void
  onToggleService: (assetId: string, serviceId: string) => void
  onToggleExpand: (id: string) => void
}): ReactElement {
  const headerTitle = title
  const servicesColumnTitle = isAlgorithmLayout ? 'SERVICE' : 'SERVICES'

  return (
    <div className={styles.container}>
      {isAlgorithmLayout ? (
        <StepTitle title={headerTitle} />
      ) : (
        <h1 className={styles.title}>{headerTitle}</h1>
      )}
      <div className={styles.boxModel}>
        <div className={styles.header}>
          <div className={styles.checkboxColumn} />
          <div className={styles.servicesColumn}>{servicesColumnTitle}</div>
          <div className={styles.titleColumn}>TITLE</div>
          <div className={styles.descriptionColumn}>DESCRIPTION</div>
          <div className={styles.typeColumn}>TYPE</div>
          <div className={styles.durationColumn}>DURATION</div>
          <div className={styles.priceColumn}>PRICE</div>
        </div>

        {assets.map((asset) => (
          <div
            key={asset.id}
            className={isAlgorithmLayout ? styles.algorithm : styles.dataset}
          >
            <Row
              asset={asset}
              onToggleAsset={onToggleAsset}
              onToggleExpand={onToggleExpand}
              isAlgorithmLayout={isAlgorithmLayout}
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
                        onChange={() => onToggleService(asset.id, service.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className={styles.servicesColumn}>
                      {service.name.slice(0, 15)}
                      {service.name.length > 15 ? '...' : ''}
                    </div>
                    <div className={styles.titleColumn}>{service.title}</div>
                    <div className={styles.descriptionColumn}>
                      {service.description.slice(0, 15)}
                      {service.description.length > 15 ? '...' : ''}
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
                      <span className={styles.symbol}>{service.symbol}</span>
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

  // dataset flow: fetch algorithm + single service
  useEffect(() => {
    if (!isDatasetFlow) return
    if (!values.algorithm || assets.length > 0) return

    const fetchAlgorithm = async () => {
      setIsLoading(true)
      try {
        let algorithmId: string
        let serviceId: string | null = null
        try {
          const parsed = JSON.parse(values.algorithm as string)
          algorithmId = parsed?.algoDid || (values.algorithm as string)
          serviceId = parsed?.serviceId || null
        } catch {
          algorithmId = values.algorithm as string
        }
        const assetDdo =
          ddoListAlgorithms.find((ddo) => ddo.id === algorithmId) || null
        if (!assetDdo || !serviceId) return

        const idx = assetDdo.credentialSubject?.services?.findIndex(
          (svc: Service) => svc.id === serviceId
        )
        const svc =
          idx !== undefined && idx !== -1
            ? assetDdo.credentialSubject.services[idx]
            : undefined
        const price =
          idx !== undefined && idx !== -1
            ? assetDdo.indexedMetadata.stats[idx].prices[0].price
            : undefined
        if (!svc) return

        const chainId = assetDdo.credentialSubject?.chainId
        if (!chainId) return

        const { oceanTokenAddress } = getOceanConfig(chainId)
        const signer = await getDummySigner(chainId)
        const tokenDetails = await getTokenInfo(
          oceanTokenAddress,
          signer.provider
        )

        const normalized: NormalizedAsset = {
          id: assetDdo.id,
          name:
            extractString(assetDdo.credentialSubject?.metadata?.name) ||
            'Selected Algorithm',
          expanded: true,
          checked: true,
          services: [
            {
              id: svc.id,
              title: extractString(svc.name) || svc.type,
              name: extractString(svc.name) || svc.type,
              description:
                extractString(svc.description) || `Service for ${svc.type}`,
              type: svc.type,
              duration: Number(svc.timeout ?? 0),
              price: Number(price ?? 0),
              symbol: tokenDetails.symbol,
              checked: true
            }
          ]
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
          services: [
            {
              id: svc.id,
              name: normalized.services[0].name,
              title: normalized.services[0].title,
              serviceDescription: normalized.services[0].description,
              type: normalized.services[0].type,
              duration: normalized.services[0].duration,
              price: normalized.services[0].price,
              symbol: normalized.services[0].symbol,
              checked: true,
              userParameters: svc.consumerParameters
            }
          ]
        })
        setFieldValue('serviceSelected', true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlgorithm()
  }, [
    isDatasetFlow,
    values.algorithm,
    assets.length,
    ddoListAlgorithms,
    setFieldValue
  ])

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const svcId = (svc as any).serviceId || (svc as any).id
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
  }, [assets, isDatasetFlow, setFieldValue, values.datasets])

  // sync serviceSelected
  useEffect(() => {
    setFieldValue('serviceSelected', anyServiceSelected(assets))
  }, [assets, setFieldValue])

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
        <StepTitle title="Select Algorithm Services" />
        <p>Please select an algorithm first</p>
      </div>
    )
  }

  return (
    <div className={styles.listWrapper}>
      <List
        title={isDatasetFlow ? 'Select Algorithm Services' : 'Select Services'}
        assets={assets}
        isAlgorithmLayout={isDatasetFlow}
        onToggleAsset={handleToggleAsset}
        onToggleService={handleToggleService}
        onToggleExpand={handleToggleExpand}
      />
      <LoaderOverlay
        visible={isLoading}
        message={isDatasetFlow ? 'Loading services...' : 'Loading services...'}
      />
    </div>
  )
}
