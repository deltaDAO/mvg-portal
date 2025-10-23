import { ReactElement, useEffect, useState } from 'react'
import { useFormikContext } from 'formik'
import { useAccount } from 'wagmi'
import { getAlgorithmDatasetsForCompute } from '@utils/aquarius'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { useCancelToken } from '@hooks/useCancelToken'
import { truncateDid } from '@utils/string'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import styles from './index.module.css'
import Pagination from '@shared/Pagination'

const ASSETS_PER_PAGE = 5

type FormValues = {
  dataset: string[]
}

export default function AlgorithmDatasetsListForComputeSelection({
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
  const [datasetsForCompute, setDatasetsForCompute] = useState<
    AssetSelectionAsset[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const newCancelToken = useCancelToken()

  useEffect(() => {
    if (!accessDetails.type) return

    async function fetchDatasets() {
      const datasets = await getAlgorithmDatasetsForCompute(
        asset.id,
        service.id,
        service.serviceEndpoint,
        accountId,
        asset.credentialSubject?.chainId,
        newCancelToken()
      )
      setDatasetsForCompute(datasets)
      console.log('Dataset list for algo...', JSON.stringify(datasets, null, 2))

      // Auto-select first if nothing is selected
      if (
        datasets.length > 0 &&
        (!values.dataset || values.dataset.length === 0)
      ) {
        const firstCombined = `${datasets[0].did}|${datasets[0].serviceId}`
        setFieldValue('dataset', [firstCombined])
      }
    }

    if (asset.credentialSubject?.metadata.type === 'algorithm') {
      fetchDatasets()
    }
  }, [accessDetails, accountId, asset, newCancelToken, service])

  const totalPages = Math.ceil(datasetsForCompute.length / ASSETS_PER_PAGE)
  const paginatedAssets = datasetsForCompute.slice(
    (currentPage - 1) * ASSETS_PER_PAGE,
    currentPage * ASSETS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page + 1)
  }

  return (
    <div className={styles.datasetsContainer}>
      <h3 className={styles.text}>Select a dataset to start a compute job</h3>

      {paginatedAssets.length === 0 ? (
        <p>No datasets available for this algorithm.</p>
      ) : (
        <div className={styles.radioList}>
          {paginatedAssets.map((dataset) => {
            const combinedValue = `${dataset.did}|${dataset.serviceId}`

            return (
              <label key={combinedValue} className={styles.radioItem}>
                <input
                  type="checkbox"
                  name="dataset"
                  value={combinedValue}
                  checked={values.dataset.includes(combinedValue)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFieldValue('dataset', [
                        ...values.dataset,
                        combinedValue
                      ])
                    } else {
                      setFieldValue(
                        'dataset',
                        values.dataset.filter((val) => val !== combinedValue)
                      )
                    }
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {dataset.name || 'Unnamed Dataset'} - {dataset.serviceName}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#555' }}>
                    {truncateDid(dataset.did)}
                  </div>
                  <div style={{ fontSize: '0.8em', color: '#007700' }}>
                    {dataset.price === 0 ? 'Free' : `${dataset.price} OCEAN`}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}

      <div className={styles.selectedInfo}>
        {values.dataset?.length} dataset
        {values.dataset?.length !== 1 ? 's' : ''} selected
      </div>

      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onChangePage={handlePageChange}
        />
      )}
    </div>
  )
}
