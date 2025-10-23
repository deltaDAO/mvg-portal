import { ReactElement, useState, useEffect, useMemo } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import StepTitle from '@shared/StepTitle'
import { useCancelToken } from '@hooks/useCancelToken'
import DatasetSelection from '@shared/FormInput/InputElement/DatasetSelection'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { AssetExtended } from 'src/@types/AssetExtended'
import Loader from '@shared/atoms/Loader'
import styles from './index.module.css'

type FormValues = {
  dataset: string
  selectedAlgorithm: any
  algorithm: string
  selectedAsset?: any
}

export default function SelectAlgorithm({
  asset,
  algorithms
}: {
  asset: AssetExtended
  algorithms: AssetSelectionAsset[]
}): ReactElement {
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const newCancelToken = useCancelToken()
  const [datasetsForCompute, setDatasetsForCompute] = useState<any[]>([])
  const [isLoadingDatasets, setIsLoadingDatasets] = useState(false)

  const selectedDatasetId = useMemo(
    () => values.dataset || '',
    [values.dataset]
  )

  function transformDatasets(
    datasets: AssetSelectionAsset[],
    selectedId: string = ''
  ): any[] {
    const grouped: Record<string, any> = {}

    for (const ds of datasets) {
      if (!grouped[ds.did]) {
        grouped[ds.did] = {
          did: ds.did,
          name: ds.name || ds.did, // fallback to DID instead of "Unnamed"
          symbol: ds.symbol,
          datasetPrice: 0,
          description: ds.description,
          expanded: selectedId === ds.did,
          checked: selectedId === ds.did,
          services: []
        }
      }

      grouped[ds.did].services.push({
        serviceId: ds.serviceId,
        serviceName: ds.serviceName || `${ds.serviceType} Service`,
        serviceDescription: ds.serviceDescription || '',
        serviceDuration: ds.serviceDuration || 'not coming',
        serviceType: ds.serviceType,
        price: ds.price,
        tokenSymbol: ds.tokenSymbol,
        checked: false,
        isAccountIdWhitelisted: ds.isAccountIdWhitelisted,
        datetime: ds.datetime
      })

      grouped[ds.did].datasetPrice += ds.price
    }

    return Object.values(grouped)
  }

  useEffect(() => {
    if (asset.credentialSubject?.metadata.type !== 'dataset') return

    async function getDatasetsAllowedForCompute() {
      setIsLoadingDatasets(true)
      try {
        const grouped = transformDatasets(algorithms, selectedDatasetId)
        setDatasetsForCompute(grouped)
      } catch (error) {
        console.error('Error transforming datasets:', error)
        setDatasetsForCompute([])
      } finally {
        setIsLoadingDatasets(false)
      }
    }

    getDatasetsAllowedForCompute()
  }, [accountId, asset, algorithms, selectedDatasetId])

  const handleDatasetSelect = (did: string) => {
    const newSelectedId = selectedDatasetId === did ? '' : did

    const updatedDatasets = datasetsForCompute.map((ds) => ({
      ...ds,
      checked: ds.did === newSelectedId,
      expanded: ds.did === newSelectedId,
      services: ds.services.map((s) => ({ ...s, checked: false }))
    }))

    setDatasetsForCompute(updatedDatasets)

    const selectedAlgorithm = updatedDatasets.find(
      (ds) => ds.did === newSelectedId
    )

    const algorithmValue =
      newSelectedId && selectedAlgorithm
        ? JSON.stringify({
            algoDid: newSelectedId,
            serviceId: selectedAlgorithm.services[0]?.serviceId || ''
          })
        : ''

    setFieldValue('dataset', newSelectedId)
    setFieldValue('selectedAlgorithm', selectedAlgorithm || {})
    setFieldValue('algorithm', algorithmValue)
    setFieldValue('selectedAsset', {})
  }

  return (
    <>
      <StepTitle title="Select Algorithm" />
      <div className={styles.environmentSelection}>
        {isLoadingDatasets ? (
          <Loader message="Loading Algorithms..." />
        ) : (
          <DatasetSelection
            asset={asset}
            datasets={datasetsForCompute}
            selected={selectedDatasetId ? [selectedDatasetId] : []}
            onChange={handleDatasetSelect}
          />
        )}
      </div>
    </>
  )
}
