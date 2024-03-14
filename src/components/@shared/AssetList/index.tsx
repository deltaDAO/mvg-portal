import AssetTeaser from '@shared/AssetTeaser'
import { ReactElement, useEffect, useState } from 'react'
import Pagination from '@shared/Pagination'
import styles from './index.module.css'
import AssetTitle from '@shared/AssetListTitle'
import Table, { TableOceanColumn } from '../atoms/Table'
import Price from '../Price'
import AssetType from '../AssetType'
import { getServiceByName } from '@utils/ddo'
import AssetViewSelector, { AssetViewOptions } from './AssetViewSelector'
import Time from '../atoms/Time'
import Loader from '../atoms/Loader'
import NetworkName from '../NetworkName'
import { useUserPreferences } from '../../../@context/UserPreferences'
import { ChainDoesNotSupportMulticallError } from 'wagmi'

const networkColumn: TableOceanColumn<AssetExtended> = {
  name: 'Network',
  selector: (row) => {
    const { chainId } = row
    return <NetworkName networkId={chainId} />
  },
  maxWidth: '10rem'
}

const tableColumns: TableOceanColumn<AssetExtended>[] = [
  {
    name: 'Dataset',
    selector: (row) => {
      const { metadata } = row
      return (
        <div>
          <AssetTitle title={metadata.name} asset={row} />
          <p>{row.id}</p>
        </div>
      )
    },
    maxWidth: '35rem',
    grow: 1
  },
  {
    name: 'Type',
    selector: (row) => {
      const { metadata } = row
      const isCompute = Boolean(getServiceByName(row, 'compute'))
      const accessType = isCompute ? 'compute' : 'access'
      return (
        <AssetType
          className={styles.typeLabel}
          type={metadata.additionalInformation?.saas ? 'saas' : metadata.type}
          accessType={
            metadata.additionalInformation?.saas ? 'saas' : accessType
          }
        />
      )
    },
    maxWidth: '9rem'
  },
  {
    name: 'Price',
    selector: (row) => {
      return <Price price={row.stats.price} size="small" />
    },
    maxWidth: '7rem'
  },
  {
    name: 'Sales',
    selector: (row) => {
      return <strong>{row.stats.orders < 0 ? 'N/A' : row.stats.orders}</strong>
    },
    maxWidth: '7rem'
  },
  {
    name: 'Published',
    selector: (row) => {
      return <Time date={row.nft.created} />
    },
    maxWidth: '7rem'
  }
]

export declare type AssetListProps = {
  assets: AssetExtended[]
  showPagination: boolean
  page?: number
  totalPages?: number
  isLoading?: boolean
  onPageChange?: React.Dispatch<React.SetStateAction<number>>
  className?: string
  noPublisher?: boolean
  noDescription?: boolean
  noPrice?: boolean
  showAssetViewSelector?: boolean
  defaultAssetView?: AssetViewOptions
}

export default function AssetList({
  assets,
  showPagination,
  page,
  totalPages,
  isLoading,
  onPageChange,
  className,
  noPublisher,
  noDescription,
  noPrice,
  showAssetViewSelector,
  defaultAssetView
}: AssetListProps): ReactElement {
  const { chainIds } = useUserPreferences()

  const [columns, setColumns] = useState(tableColumns)

  useEffect(() => {
    if (chainIds.length > 1) {
      const [datasetColumn, ...otherColumns] = tableColumns
      setColumns([datasetColumn, networkColumn, ...otherColumns])
    } else setColumns(tableColumns)
  }, [chainIds])

  const [activeAssetView, setActiveAssetView] = useState<AssetViewOptions>(
    defaultAssetView || AssetViewOptions.Grid
  )

  // This changes the page field inside the query
  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  const styleClasses = `${styles.assetList} ${className || ''}`

  return isLoading ? (
    <Loader />
  ) : (
    <>
      {showAssetViewSelector && (
        <AssetViewSelector
          activeAssetView={activeAssetView}
          setActiveAssetView={setActiveAssetView}
        />
      )}
      <div className={styleClasses}>
        {assets?.length > 0 ? (
          <>
            {activeAssetView === AssetViewOptions.List && (
              <Table
                columns={columns}
                data={assets}
                pagination={false}
                paginationPerPage={assets?.length}
                dense
              />
            )}

            {activeAssetView === AssetViewOptions.Grid &&
              assets?.map((asset) => (
                <AssetTeaser
                  asset={asset}
                  key={asset.id}
                  noPublisher={noPublisher}
                  noDescription={noDescription}
                  noPrice={noPrice}
                />
              ))}
          </>
        ) : (
          <div className={styles.empty}>No results found</div>
        )}
      </div>
      {showPagination && (
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onChangePage={handlePageChange}
        />
      )}
    </>
  )
}
