import AssetTeaser from '@shared/AssetTeaser'
import React, { ReactElement, useEffect, useState } from 'react'
import Pagination from '@shared/Pagination'
import styles from './index.module.css'
import Loader from '@shared/atoms/Loader'
import { useIsMounted } from '@hooks/useIsMounted'
import { getAccessDetailsForAssets } from '@utils/accessDetailsAndPricing'
import { useWeb3 } from '@context/Web3'
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
      const { accessDetails } = row
      return <Price accessDetails={accessDetails} size="small" />
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

function LoaderArea() {
  return (
    <div className={styles.loaderWrap}>
      <Loader />
    </div>
  )
}

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
  const { accountId } = useWeb3()
  const [assetsWithPrices, setAssetsWithPrices] =
    useState<AssetExtended[]>(assets)
  const [loading, setLoading] = useState<boolean>(isLoading)
  const [activeAssetView, setActiveAssetView] = useState<AssetViewOptions>(
    defaultAssetView || AssetViewOptions.Grid
  )

  const isMounted = useIsMounted()

  useEffect(() => {
    if (!assets || !assets.length) {
      setAssetsWithPrices([])
      return
    }

    setAssetsWithPrices(assets as AssetExtended[])
    setLoading(false)
    async function fetchPrices() {
      const assetsWithPrices = await getAccessDetailsForAssets(
        assets,
        accountId || ''
      )
      if (!isMounted() || !assetsWithPrices) return
      setAssetsWithPrices([...assetsWithPrices])
    }
    fetchPrices()
  }, [assets, isMounted, accountId])

  // // This changes the page field inside the query
  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  const styleClasses = `${styles.assetList} ${className || ''}`

  return loading ? (
    <LoaderArea />
  ) : (
    <>
      {showAssetViewSelector && (
        <AssetViewSelector
          activeAssetView={activeAssetView}
          setActiveAssetView={setActiveAssetView}
        />
      )}
      <div className={styleClasses}>
        {assetsWithPrices?.length > 0 ? (
          <>
            {activeAssetView === AssetViewOptions.List && (
              <Table
                columns={columns}
                data={assetsWithPrices}
                pagination={false}
                paginationPerPage={assetsWithPrices?.length}
              />
            )}

            {activeAssetView === AssetViewOptions.Grid &&
              assetsWithPrices?.map((assetWithPrice) => (
                <AssetTeaser
                  asset={assetWithPrice}
                  key={assetWithPrice.id}
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
