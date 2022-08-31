import AssetTeaser from '../molecules/AssetTeaser'
import React, { useEffect, useState } from 'react'
import Pagination from '../molecules/Pagination'
import styles from './AssetList.module.css'
import { DDO } from '@oceanprotocol/lib'
import classNames from 'classnames/bind'
import { getAssetsBestPrices, AssetListPrices } from '../../utils/subgraph'
import Loader from '../atoms/Loader'
import { useUserPreferences } from '../../providers/UserPreferences'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import { useIsMounted } from '../../hooks/useIsMounted'
import { getAssetsForProviders, getFilterTerm } from '../../utils/aquarius'
import { useCancelToken } from '../../hooks/useCancelToken'

const cx = classNames.bind(styles)

function LoaderArea() {
  return (
    <div className={styles.loaderWrap}>
      <Loader />
    </div>
  )
}

declare type AssetListProps = {
  assets: DDO[]
  showPagination: boolean
  page?: number
  totalPages?: number
  isLoading?: boolean
  onPageChange?: React.Dispatch<React.SetStateAction<number>>
  className?: string
  noPublisher?: boolean
}

const AssetList: React.FC<AssetListProps> = ({
  assets,
  showPagination,
  page,
  totalPages,
  isLoading,
  onPageChange,
  className,
  noPublisher
}) => {
  const { appConfig } = useSiteMetadata()
  const { chainIds } = useUserPreferences()
  const [assetsWithPrices, setAssetWithPrices] = useState<AssetListPrices[]>()
  const [edgeAssetsList, setEdgeAssetsList] = useState<string[]>([])
  const isMounted = useIsMounted()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    if (!assets) return
    async function getEdgeAssetList() {
      const datasets = assets.filter((asset) => {
        const { type } = asset.findServiceByType('metadata').attributes.main
        return type === 'dataset'
      })
      const assetsServiceEndpoints = datasets?.map((asset) => {
        const { serviceEndpoint } = asset.findServiceByType('compute')
        return serviceEndpoint
      })
      const edgeDeviceList = await getAssetsForProviders(
        [...new Set(assetsServiceEndpoints.filter((e) => e !== undefined))],
        chainIds,
        newCancelToken(),
        [getFilterTerm('service.type', 'edge')]
      )
      const edgeDeviceProviders = [
        ...new Set(
          edgeDeviceList.map((device) => {
            const { serviceEndpoint } = device.findServiceByType('edge')
            return serviceEndpoint.replace(/\/$/, '').toLowerCase()
          })
        )
      ]
      const edgeAssets = datasets.filter((asset) => {
        const { serviceEndpoint } = asset.findServiceByType('compute')
        return edgeDeviceProviders.includes(
          serviceEndpoint.replace(/\/$/, '').toLowerCase()
        )
      })
      const edgeAssetDIDs = edgeAssets.map((asset) => asset.id)
      setEdgeAssetsList(edgeAssetDIDs)
    }

    async function fetchPrices() {
      const asset = await getAssetsBestPrices(assets)
      if (!isMounted()) return
      setAssetWithPrices(asset)
    }

    getEdgeAssetList()
    fetchPrices()
  }, [assets, chainIds, isMounted, newCancelToken])

  // This changes the page field inside the query
  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  const styleClasses = cx({
    assetList: true,
    [className]: className
  })

  return chainIds.length === 0 ? (
    <div className={styleClasses}>
      <div className={styles.empty}>No network selected</div>
    </div>
  ) : assetsWithPrices || assets ? (
    <>
      <div className={styleClasses}>
        {assetsWithPrices && assetsWithPrices.length > 0 ? (
          assetsWithPrices.map((assetWithPrice) => (
            <AssetTeaser
              ddo={assetWithPrice.ddo}
              price={assetWithPrice.price}
              key={assetWithPrice.ddo.id}
              noPublisher={noPublisher}
              isEdgeAsset={edgeAssetsList.includes(assetWithPrice.ddo.id)}
            />
          ))
        ) : assets.length > 0 ? (
          assets.map((asset) => (
            <AssetTeaser
              ddo={asset}
              key={asset.id}
              noPublisher={noPublisher}
              isEdgeAsset={edgeAssetsList.includes(asset.id)}
            />
          ))
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
  ) : (
    <LoaderArea />
  )
}

export default AssetList
