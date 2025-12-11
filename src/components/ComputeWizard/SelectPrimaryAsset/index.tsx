'use client'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Field, useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import StepTitle from '@shared/StepTitle'
import Input from '@shared/FormInput'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import DatasetSelection from '@shared/FormInput/InputElement/DatasetSelection'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAlgorithmDatasetsForComputeSelection } from '@utils/aquarius'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { ComputeFlow, FormComputeData } from '../_types'
import styles from './index.module.css'
import LoaderOverlay from '../LoaderOverlay'

type DatasetService = {
  serviceId: string
  serviceName?: string
  serviceDescription?: string
  serviceDuration?: string | number
  serviceType?: string
  price?: number
  tokenSymbol?: string
  checked?: boolean
  isAccountIdWhitelisted?: boolean
  datetime?: string
  userParameters?: any[]
}

type DatasetItem = {
  did: string
  name: string
  symbol?: string
  description?: string
  datasetPrice: number
  expanded?: boolean
  checked?: boolean
  services: DatasetService[]
}

interface SelectPrimaryAssetProps {
  flow: ComputeFlow
  algorithms?: AssetSelectionAsset[]
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
}

type RawDatasetEntry = {
  did?: string
  id?: string
  name: string
  symbol?: string
  description?: string
  serviceId: string
  serviceName?: string
  serviceDescription?: string
  serviceDuration?: string
  serviceType?: string
  price?: number | string
  tokenSymbol?: string
  checked?: boolean
  isAccountIdWhitelisted?: boolean
  datetime?: string
  userParameters?: DatasetService['userParameters']
}

function transformDatasets(
  datasets: RawDatasetEntry[],
  selectedIds: string[] = []
): DatasetItem[] {
  const grouped: Record<string, DatasetItem> = {}

  for (const ds of datasets) {
    const identifier = ds.did || ds.id

    if (!grouped[identifier]) {
      grouped[identifier] = {
        did: identifier,
        name: ds.name,
        symbol: ds.symbol,
        description: ds.description,
        datasetPrice: 0,
        expanded: selectedIds.includes(identifier),
        checked: selectedIds.includes(identifier),
        services: []
      }
    }

    const priceValue =
      typeof ds.price === 'string' ? Number(ds.price) : ds.price ?? 0

    const service: DatasetService = {
      serviceId: ds.serviceId,
      serviceName: ds.serviceName,
      serviceDescription: ds.serviceDescription,
      serviceDuration: (ds.serviceDuration ??
        0) as DatasetService['serviceDuration'],
      serviceType: ds.serviceType,
      price: priceValue,
      tokenSymbol: ds.tokenSymbol,
      checked: ds.checked,
      isAccountIdWhitelisted: ds.isAccountIdWhitelisted,
      datetime: ds.datetime,
      userParameters: ds.userParameters ?? []
    }

    grouped[identifier].services.push(service)
    grouped[identifier].datasetPrice += priceValue
  }

  return Object.values(grouped)
}

export default function SelectPrimaryAsset({
  flow,
  algorithms = [],
  asset,
  service,
  accessDetails
}: SelectPrimaryAssetProps): ReactElement {
  const isDatasetFlow = flow === 'dataset'
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormComputeData>()
  const newCancelToken = useCancelToken()
  const [datasetsForCompute, setDatasetsForCompute] = useState<DatasetItem[]>()
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false)

  const selectedDatasetIds = useMemo(() => {
    const ids =
      values.datasets?.map((dataset) => dataset.did ?? dataset.id) ?? []
    return ids.filter((identifier): identifier is string => Boolean(identifier))
  }, [values.datasets])

  useEffect(() => {
    if (isDatasetFlow) return
    if (!accessDetails.type) return
    if (asset.credentialSubject?.metadata.type !== 'algorithm') return

    const selectedIdsSnapshot =
      values.datasets
        ?.map((dataset) => dataset.did ?? dataset.id)
        .filter((identifier): identifier is string => Boolean(identifier)) ?? []

    async function getDatasetsAllowedForCompute() {
      setIsLoadingDatasets(true)
      try {
        const datasets = await getAlgorithmDatasetsForComputeSelection(
          asset.id,
          service.id,
          service.serviceEndpoint,
          accountId,
          asset.credentialSubject?.chainId,
          newCancelToken()
        )
        const datasetsRaw = (datasets as unknown as RawDatasetEntry[]) ?? []
        const groupedDatasets = transformDatasets(
          datasetsRaw,
          selectedIdsSnapshot
        )
        setDatasetsForCompute(groupedDatasets)
      } catch (error) {
        console.error('Error fetching datasets:', error)
        setDatasetsForCompute([])
      } finally {
        setIsLoadingDatasets(false)
      }
    }

    getDatasetsAllowedForCompute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDatasetFlow, accessDetails, accountId, asset, newCancelToken, service])

  const handleDatasetSelect = (did: string) => {
    if (isDatasetFlow) return

    const isCurrentlySelected = selectedDatasetIds.includes(did)
    const updatedDatasetIds = isCurrentlySelected
      ? selectedDatasetIds.filter((id) => id !== did)
      : [...selectedDatasetIds, did]

    const updatedDatasets =
      datasetsForCompute?.map((ds) => ({
        ...ds,
        checked: updatedDatasetIds.includes(ds.did),
        expanded: updatedDatasetIds.includes(ds.did)
      })) || []

    setDatasetsForCompute(updatedDatasets)

    const selectedDatasets = updatedDatasets.filter((ds) =>
      updatedDatasetIds.includes(ds.did)
    )

    setFieldValue('datasets', selectedDatasets)
  }

  if (isDatasetFlow) {
    return (
      <>
        <StepTitle title="Select Algorithm" />
        <div className={styles.algorithmSelection}>
          <Field
            component={Input}
            name="algorithm"
            type="assetSelection"
            options={algorithms}
            accountId={accountId}
            selected={values.algorithm || []}
            disabled={false}
            priceOnRight
            variant="compute"
          />
        </div>
      </>
    )
  }

  const noDatasetClasses = [
    styles.noDatasetOption,
    values.withoutDataset ? styles.noDatasetOptionActive : ''
  ]
    .filter(Boolean)
    .join(' ')

  const selectionWrapperClasses = [
    styles.datasetSelectionWrapper,
    values.withoutDataset ? styles.datasetSelectionDisabled : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <StepTitle title="Select Datasets" />
      <div className={styles.environmentSelection}>
        <div className={noDatasetClasses}>
          <label className={styles.noDatasetLabel}>
            <span>Proceed without Dataset Selection</span>
            <input
              type="checkbox"
              disabled
              className={styles.noDatasetCheckbox}
              checked={values.withoutDataset || false}
              onChange={(e) => {
                const { checked } = e.target
                setFieldValue('withoutDataset', checked)
                if (checked) setFieldValue('datasets', [])
              }}
            />
          </label>
        </div>

        <div className={selectionWrapperClasses}>
          <DatasetSelection
            asset={asset}
            datasets={datasetsForCompute}
            selected={selectedDatasetIds}
            onChange={!values.withoutDataset ? handleDatasetSelect : undefined}
          />
          <LoaderOverlay
            visible={isLoadingDatasets}
            message="Loading datasets..."
          />
        </div>
      </div>
    </>
  )
}
