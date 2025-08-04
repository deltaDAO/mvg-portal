import { ChangeEvent, useEffect, useState } from 'react'
import { ComputeEnvironment } from '@oceanprotocol/lib'
import Loader from '@shared/atoms/Loader'
import { truncateDid } from '@utils/string'
import styles from './index.module.css'
import SearchSection from '@shared/SearchSection'
import StatusTag from '../../../atoms/StatusTag'
import Button from '../../../atoms/Button'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'

export interface DatasetSelectionDataset extends AssetSelectionAsset {
  checked: boolean
}

// Mock data for testing
const mockDatasets: DatasetSelectionDataset[] = [
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

export function Empty({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>
}

export default function DatasetSelection({
  datasets,
  selected = [],
  disabled,
  onChange
}: {
  datasets?: DatasetSelectionDataset[]
  selected?: string[]
  disabled?: boolean
  onChange?: (value: string) => void
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredEnvironments, setFilteredEnvironments] = useState<
    DatasetSelectionDataset[]
  >([])

  useEffect(() => {
    const realDatasets = datasets && Array.isArray(datasets) ? datasets : []
    const allDatasets = [...realDatasets, ...mockDatasets]

    const result = allDatasets.filter((dataset) => {
      const searchLower = searchValue.toLowerCase()
      return searchValue !== ''
        ? dataset.did.toLowerCase().includes(searchLower) ||
            dataset.name.toLowerCase().includes(searchLower) ||
            dataset.serviceName?.toLowerCase().includes(searchLower)
        : true
    })

    setFilteredEnvironments(result)
  }, [datasets, searchValue])

  const handleDatasetSelect = (envId: string) => {
    if (typeof onChange === 'function') {
      onChange(envId)
    }
  }

  return (
    <div className={styles.root}>
      <SearchSection
        placeholder="Search for Datasets"
        value={searchValue}
        onChange={setSearchValue}
        disabled={disabled}
      />
      <div className={styles.scroll}>
        {!filteredEnvironments ? (
          <Loader />
        ) : filteredEnvironments.length === 0 ? (
          <Empty message="No datasets found." />
        ) : (
          <>
            {filteredEnvironments.map((dataset, index) => {
              const isSelected = selected.includes(dataset.did)
              return (
                <div
                  key={dataset.did}
                  className={`${styles.datasetCard} ${
                    isSelected ? styles.selected : ''
                  }`}
                  onClick={() => !disabled && handleDatasetSelect(dataset.did)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.titleSection}>
                      <h3 className={styles.title}>Dataset {index + 1}</h3>
                      <div className={styles.envId}>
                        {truncateDid(dataset.did)}
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardContent}>
                    <p className={styles.description}>
                      {dataset.name || 'Testing Dataset name.'}
                    </p>

                    <div className={styles.cardActions}>
                      <Button style="slim">
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
