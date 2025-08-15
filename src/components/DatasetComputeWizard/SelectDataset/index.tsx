import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import StepTitle from '@shared/StepTitle'
import { useCancelToken } from '@hooks/useCancelToken'
import DatasetSelection from '@shared/FormInput/InputElement/DatasetSelection'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { getAlgorithmDatasetsForComputeSelection } from '@utils/aquarius'
import { FormComputeData } from '../_types'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import styles from './index.module.css'

type FormValues = {
  dataset: string[]
}

export interface DatasetSelectionDataset extends AssetSelectionAsset {
  checked: boolean
}

export default function SelectDataset({
  asset,
  service,
  accessDetails
}: {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
}): ReactElement {
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([])
  const newCancelToken = useCancelToken()
  const [datasetsForCompute, setDatasetsForCompute] = useState<any[]>()

  function transformDatasets(
    datasets: AssetSelectionAsset[],
    selectedIds: string[] = []
  ): any[] {
    const grouped: Record<string, any> = {}

    for (const ds of datasets) {
      if (!grouped[ds.did]) {
        grouped[ds.did] = {
          did: ds.did,
          name: ds.name,
          symbol: ds.symbol,
          datasetPrice: 0,
          description: ds.description,
          expanded: selectedIds.includes(ds.did),
          checked: selectedIds.includes(ds.did),
          services: []
        }
      }

      grouped[ds.did].services.push({
        serviceId: ds.serviceId,
        serviceName: ds.serviceName,
        serviceDescription: ds.serviceDescription,
        serviceDuration: ds.serviceDuration,
        serviceType: ds.serviceType,
        price: ds.price,
        tokenSymbol: ds.tokenSymbol,
        checked: ds.checked,
        isAccountIdWhitelisted: ds.isAccountIdWhitelisted,
        datetime: ds.datetime
      })

      grouped[ds.did].datasetPrice += ds.price
    }

    return Object.values(grouped)
  }

  useEffect(() => {
    if (!accessDetails.type) return

    async function getDatasetsAllowedForCompute() {
      const datasets = await getAlgorithmDatasetsForComputeSelection(
        asset.id,
        service.id,
        service.serviceEndpoint,
        accountId,
        asset.credentialSubject?.chainId,
        newCancelToken()
      )

      const groupedDatasets = transformDatasets(datasets)
      setDatasetsForCompute(groupedDatasets)
    }

    if (asset.credentialSubject?.metadata.type === 'algorithm') {
      getDatasetsAllowedForCompute()
    }
  }, [accessDetails, accountId, asset, newCancelToken, service])

  // useEffect(() => {
  //   // Initialize from form values if needed
  //   if (Array.isArray(values.dataset)) {
  //     const existingIds = values.dataset.map((env) => env.)
  //     setSelectedDatasetIds(existingIds)
  //   }
  // }, [values.dataset])

  const handleDatasetSelect = (did: string) => {
    const updatedDatasetIds = selectedDatasetIds.includes(did)
      ? selectedDatasetIds.filter((id) => id !== did)
      : [...selectedDatasetIds, did]

    setSelectedDatasetIds(updatedDatasetIds)

    const updatedDatasets = datasetsForCompute?.map((ds) => ({
      ...ds,
      checked: updatedDatasetIds.includes(ds.did),
      expanded: updatedDatasetIds.includes(ds.did)
    }))
    setDatasetsForCompute(updatedDatasets)

    const selectedDatasets = updatedDatasets?.filter((ds) =>
      updatedDatasetIds.includes(ds.did)
    )

    setFieldValue('datasets', selectedDatasets)
  }

  return (
    <>
      <StepTitle title="Select Datasets" />
      <div className={styles.environmentSelection}>
        <DatasetSelection
          asset={asset}
          datasets={datasetsForCompute}
          selected={selectedDatasetIds}
          onChange={handleDatasetSelect}
        />
      </div>
    </>
  )
}
