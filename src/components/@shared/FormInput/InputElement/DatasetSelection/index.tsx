import { useEffect, useState } from 'react'
import Loader from '@shared/atoms/Loader'
import { truncateDid } from '@utils/string'
import styles from './index.module.css'
import SearchSection from '@shared/SearchSection'
import Button from '../../../atoms/Button'
import NetworkName from '@shared/NetworkName'
import External from '@images/external.svg'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { AssetExtended } from 'src/@types/AssetExtended'

export interface DatasetSelectionDataset extends AssetSelectionAsset {
  checked: boolean
  value?: string
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
  datasets?: DatasetSelectionDataset[]
  selected?: string[]
  disabled?: boolean
  onChange?: (value: string) => void
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredDatasets, setfilteredDatasets] = useState<
    DatasetSelectionDataset[]
  >([])

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
            {filteredDatasets.map((dataset) => {
              const selectionValue = dataset.value || dataset.did
              const isSelected = selected.includes(selectionValue)
              const descriptionText =
                dataset.description ||
                dataset.serviceDescription ||
                'No description available.'
              return (
                <div
                  key={selectionValue}
                  className={`${styles.datasetCard} ${
                    isSelected ? styles.selected : ''
                  }`}
                  onClick={() =>
                    !disabled && handleDatasetSelect(selectionValue)
                  }
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.titleSection}>
                      <h3 className={styles.title}>{dataset.name}</h3>
                      <div className={styles.envId}>
                        {truncateDid(dataset.did)}
                        {dataset.did && (
                          <a
                            href={`/asset/${encodeURIComponent(dataset.did)}`}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.externalLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <External />
                          </a>
                        )}
                      </div>
                      {dataset.tokenSymbol && (
                        <div className={styles.tokenSymbol}>
                          {dataset.tokenSymbol}
                        </div>
                      )}
                    </div>
                    <div>
                      <NetworkName
                        networkId={asset?.credentialSubject?.chainId}
                        className={styles.network}
                      />
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.description}>
                      {descriptionText.slice(0, 30)}
                      {descriptionText.length > 30 ? '...' : ''}
                    </p>

                    <div className={styles.cardActions}>
                      <Button
                        type="button"
                        style="slim"
                        onClick={() => onChange?.(selectionValue)}
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
