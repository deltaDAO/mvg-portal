import AssetTeaser from '@shared/AssetTeaser'
import React, { ReactElement, useState } from 'react'
import Pagination from '@shared/Pagination'
import styles from './index.module.css'
import AssetTitle from '@shared/AssetListTitle'
import Table, { TableOceanColumn } from '../atoms/Table'
import Price from '../Price'
import AssetType from '../AssetType'
import { getServiceByName } from '@utils/ddo'
import AssetViewSelector, { AssetViewOptions } from './AssetViewSelector'

const columns: TableOceanColumn<AssetExtended>[] = [
  {
    name: 'Dataset',
    selector: (row) => {
      const { metadata } = row
      return <AssetTitle title={metadata.name} asset={row} />
    },
    maxWidth: '40rem',
    grow: 1
  },
  {
    name: 'Price',
    selector: (row) => {
      return <Price price={row.stats.price} size="small" />
    },
    maxWidth: '10rem'
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
          type={metadata.type}
          accessType={accessType}
        />
      )
    },
    maxWidth: '10rem'
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
  onPageChange,
  className,
  noPublisher,
  noDescription,
  noPrice,
  showAssetViewSelector,
  defaultAssetView
}: AssetListProps): ReactElement {
  const [activeAssetView, setActiveAssetView] = useState<AssetViewOptions>(
    defaultAssetView || AssetViewOptions.Grid
  )

  // This changes the page field inside the query
  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  const styleClasses = `${styles.assetList} ${className || ''}`

  return (
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
