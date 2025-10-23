import { ChangeEvent, useEffect, useState } from 'react'
import Loader from '@shared/atoms/Loader'
import { truncateDid } from '@utils/string'
import styles from './index.module.css'
import SearchSection from '@shared/SearchSection'
import Button from '../../../atoms/Button'
import NetworkName from '@shared/NetworkName'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { AssetExtended } from 'src/@types/AssetExtended'

export interface DatasetSelectionDataset extends AssetSelectionAsset {
  checked: boolean
}

export function Empty({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>
}

export default function DatasetSelection({
  asset,
  datasets,
  selected = [],
  disabled,
  onChange
}: {
  asset?: AssetExtended
  datasets?: any[]
  selected?: string[]
  disabled?: boolean
  onChange?: (value: string) => void
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredDatasets, setfilteredDatasets] = useState<any[]>([])

  useEffect(() => {
    const realDatasets = datasets && Array.isArray(datasets) ? datasets : []
    const result = realDatasets.filter((dataset) => {
      const searchLower = searchValue.toLowerCase()
      return searchValue !== ''
        ? dataset.did.toLowerCase().includes(searchLower) ||
            dataset.name.toLowerCase().includes(searchLower) ||
            dataset.serviceName?.toLowerCase().includes(searchLower)
        : true
    })

    setfilteredDatasets(result)
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
        {!filteredDatasets ? (
          <Loader />
        ) : filteredDatasets.length === 0 ? (
          <Empty message="No datasets found." />
        ) : (
          <>
            {filteredDatasets.map((dataset, index) => {
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
                      <h3 className={styles.title}>{dataset.name}</h3>
                      <div className={styles.envId}>
                        {truncateDid(dataset.did)}
                      </div>
                    </div>
                    <div>
                      <NetworkName
                        networkId={asset?.credentialSubject?.chainId}
                        className={styles.network}
                      />
                      <div className={styles.price}>
                        {dataset?.datasetPrice &&
                        Number(dataset.datasetPrice) > 0 ? (
                          <>
                            {dataset.datasetPrice}
                            <span className={styles.priceUnit}> OCEAN</span>
                          </>
                        ) : (
                          <span className={styles.priceUnit}> FREE</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.description}>
                      {(
                        dataset.description || 'No description available.'
                      ).slice(0, 30)}
                      {(dataset.description || 'No description available.')
                        .length > 30
                        ? '...'
                        : ''}
                    </p>

                    <div className={styles.cardActions}>
                      <Button
                        type="button"
                        style="slim"
                        onClick={() => onChange?.(dataset.did)}
                      >
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
