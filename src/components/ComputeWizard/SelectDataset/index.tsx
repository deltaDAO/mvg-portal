import { ReactElement, useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import StepTitle from '@shared/StepTitle'
import DatasetSelection from '@shared/FormInput/InputElement/DatasetSelection'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { FormComputeData } from '../_types'
import styles from './index.module.css'

type FormValues = {
  dataset: string[]
}

export interface DatasetSelectionDataset extends AssetSelectionAsset {
  checked: boolean
}

const computeDatasets: DatasetSelectionDataset[] = [
  {
    did: 'did:ope:b222d270b0cfaa3c7d4af2742796d6a6be74818c2da5e6da08c9c467929942ad',
    serviceId:
      'cc92d6a28bc24305b258b0237019fddeaa20bf39177f65bb2802e6e602a8fde2',
    serviceName: 'Service 1 ',
    name: 'Test dataset for new initializeCompute - 1',
    price: 1,
    tokenSymbol: 'OCEAN',
    checked: false,
    symbol: 'OEAT',
    isAccountIdWhitelisted: true,
    datetime: '2025-08-01T07:34:24.000Z'
  },
  {
    did: 'did:ope:f44ae0bf1220d07d457545233e542b69581ec36077e6b2a7f82096b46886e147',
    serviceId:
      '5533d30fa2f30d319263f4dbd9253eff4d3d5ea30c4cd96157a3d0792f62c394',
    serviceName: 'Service for algo',
    name: 'Test compute algo asset',
    price: 0,
    tokenSymbol: 'OCEAN',
    checked: false,
    symbol: 'OEAT',
    isAccountIdWhitelisted: true,
    datetime: '2025-07-31T06:31:12.000Z'
  },
  {
    did: 'did:ope:4d4333724cc1c56c91aec1d3c8bd4c22e9a5a6d0e71f15318fcc5c284280b710',
    serviceId:
      '80bed21c32d107b0c31f911dddb867a985cb59c26b43f0bdd721aa165d4afcd0',
    serviceName: 'Service 2.1',
    name: 'Test dataset for multiple datasets C2D - 2',
    price: 3,
    tokenSymbol: 'OCEAN',
    checked: false,
    symbol: 'OEAT',
    isAccountIdWhitelisted: true,
    datetime: '2025-07-25T08:18:48.000Z'
  },
  {
    did: 'did:ope:574e91d81980cb0e9f585e3f35ed2a24d9a6ea7da5fb304808ec0045053e2592',
    serviceId:
      '153d7d9586a28598d59d0eef4c7da7ef56fadd98367b49ecaac7437f8ea19d20',
    serviceName: 'Service 2',
    name: 'Test dataset for C2D with multiple files',
    price: 3,
    tokenSymbol: 'OCEAN',
    checked: false,
    symbol: 'OEAT',
    isAccountIdWhitelisted: true,
    datetime: '2025-07-24T14:07:48.000Z'
  }
]

export default function SelectDataset(): ReactElement {
  const { address: accountId } = useAccount()
  const { values, setFieldValue } = useFormikContext<FormValues>()
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([])
  console.log('Compute values, ', values)

  // useEffect(() => {
  //   // Initialize from form values if needed
  //   if (Array.isArray(values.dataset)) {
  //     const existingIds = values.dataset.map((env) => env.)
  //     setSelectedDatasetIds(existingIds)
  //   }
  // }, [values.dataset])

  const handleDatasetSelect = (datasetId: string) => {
    const updatedDatasetIds = selectedDatasetIds.includes(datasetId)
      ? selectedDatasetIds.filter((id) => id !== datasetId)
      : [...selectedDatasetIds, datasetId]

    setSelectedDatasetIds(updatedDatasetIds)

    const selectedDatasets = computeDatasets?.filter((env) =>
      updatedDatasetIds.includes(env.did)
    )
    setFieldValue('computeEnv', selectedDatasets)
    // ✅ Console log selected datasets
    console.log('Selected datasets:', selectedDatasets)
  }

  return (
    <>
      <StepTitle title="Select Datasets" />
      <div className={styles.environmentSelection}>
        <DatasetSelection
          selected={selectedDatasetIds}
          onChange={handleDatasetSelect}
        />
      </div>
    </>
  )
}
