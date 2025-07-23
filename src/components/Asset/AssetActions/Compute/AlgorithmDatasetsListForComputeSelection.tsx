import { ReactElement, useEffect, useState } from 'react'
import styles from './AlgorithmDatasetsListForCompute.module.css'
import { getAlgorithmDatasetsForCompute } from '@utils/aquarius'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { useCancelToken } from '@hooks/useCancelToken'
import { useAccount } from 'wagmi'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { useFormikContext } from 'formik'
import Pagination from '@components/@shared/Pagination'

type FormValues = {
  dataset: string // now stores `${did}|${serviceId}`
}

const ASSETS_PER_PAGE = 5

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
  const newCancelToken = useCancelToken()
  const { values, setFieldValue } = useFormikContext<FormValues>()

  const [datasetsForCompute, setDatasetsForCompute] = useState<
    AssetSelectionAsset[]
  >([])
  const [currentPage, setCurrentPage] = useState(1)

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

      // Auto-select first if nothing is selected
      if (datasets.length > 0 && !values.dataset) {
        const firstCombined = `${datasets[0].did}|${datasets[0].serviceId}`
        setFieldValue('dataset', firstCombined)
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

  const truncateDid = (did: string) =>
    did.length > 25 ? `${did.slice(0, 12)}...${did.slice(-8)}` : did

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
                  type="radio"
                  name="dataset"
                  value={combinedValue}
                  checked={values.dataset === combinedValue}
                  onChange={() => setFieldValue('dataset', combinedValue)}
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
