import AssetTeaser from '@shared/AssetTeaser'
import { ReactElement, useState } from 'react'
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

const columns: TableOceanColumn<AssetExtended>[] = [
  {
    name: 'Dataset',
    selector: (row) => {
      const { metadata } = row._source
      return (
        <div>
          <AssetTitle title={metadata.name} asset={row._source} />
          <p>{row._id}</p>
        </div>
      )
    },
    maxWidth: '35rem',
    grow: 1
  },
  {
    name: 'Type',
    selector: (row) => {
      const { metadata } = row._source
      const isCompute = Boolean(getServiceByName(row, 'compute'))
      const accessType = isCompute ? 'compute' : 'access'
      return (
        <AssetType
          className={styles.typeLabel}
          type={metadata.type}
          accessType={accessType}
        />
      )
    },
    maxWidth: '9rem'
  },
  {
    name: 'Price',
    selector: (row) => {
      return <Price price={row._source.stats.price} size="small" />
    },
    maxWidth: '7rem'
  },
  {
    name: 'Sales',
    selector: (row) => {
      return (
        <strong>
          {row._source.stats.orders < 0 ? 'N/A' : row._source.stats.orders}
        </strong>
      )
    },
    maxWidth: '7rem'
  },
  {
    name: 'Published',
    selector: (row) => {
      return <Time date={row._source.nft.created} />
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
  console.log('assetLists:', assets)
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
        {assets?.length > 0 && assets[0] !== undefined ? (
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
                  asset={asset._source}
                  key={asset._id}
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
