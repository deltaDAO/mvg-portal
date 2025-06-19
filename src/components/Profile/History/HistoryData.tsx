import { LoggerInstance } from '@oceanprotocol/lib'
import { ReactElement, useEffect, useState } from 'react'
import { getPublishedAssets, getUserSalesAndRevenue } from '@utils/aquarius'
import { useUserPreferences } from '@context/UserPreferences'
import styles from './HistoryData.module.css'
import { useCancelToken } from '@hooks/useCancelToken'
import Filter from '@components/Search/Filter'
import { useMarketMetadata } from '@context/MarketMetadata'
import { CancelToken } from 'axios'
import { useProfile } from '@context/Profile'
import { useFilter, Filters } from '@context/Filter'
import { useDebouncedCallback } from 'use-debounce'
import { TableOceanColumn } from '@shared/atoms/Table'
import Time from '@shared/atoms/Time'
import AssetTitle from '@shared/AssetListTitle'
import NetworkName from '@shared/NetworkName'
import HistoryTable from '@components/@shared/atoms/Table/HistoryTable'
import { getAccessDetails } from '@utils/accessDetailsAndPricing'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Asset } from 'src/@types/Asset'

const columns: TableOceanColumn<AssetExtended>[] = [
  {
    name: 'Dataset',
    selector: (asset) => <AssetTitle asset={asset} />
  },
  {
    name: 'Network',
    selector: (asset) => (
      <NetworkName networkId={asset.credentialSubject.chainId} />
    )
  },
  {
    name: 'Datatoken',
    selector: (asset) => asset.indexedMetadata.stats[0]?.symbol
  },
  {
    name: 'Time',
    selector: (asset) => {
      const unixTime = Math.floor(
        new Date(asset.credentialSubject.metadata.created).getTime()
      ).toString()
      return <Time date={unixTime} relative isUnix />
    }
  },
  {
    name: 'Sales',
    selector: (asset) => asset.indexedMetadata.stats[0]?.orders || 0
  },
  {
    name: 'Price',
    selector: (asset) => {
      const price =
        asset.indexedMetadata.stats[0]?.prices[0]?.price ??
        (asset.accessDetails[0]?.price
          ? parseFloat(asset.accessDetails[0]?.price)
          : 0)
      const tokenSymbol = asset.indexedMetadata.stats[0]?.symbol || 'OCEAN'
      return `${price} ${tokenSymbol}`
    }
  },
  {
    name: 'Revenue',
    selector: (asset) =>
      `${
        (asset.indexedMetadata.stats[0]?.orders || 0) *
        (Number(asset.indexedMetadata.stats[0]?.prices[0]?.price) || 0)
      } ${asset.indexedMetadata.stats[0]?.symbol || 'OCEAN'}`
  }
]

export default function HistoryData({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { appConfig } = useMarketMetadata()
  const { chainIds } = useUserPreferences()
  const { ownAccount } = useProfile()
  const { filters, ignorePurgatory } = useFilter()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState<number>(1)
  const [revenue, setRevenue] = useState(0)
  const [sales, setSales] = useState(0)
  const [allAssets, setAllAssets] = useState<Asset[]>([])

  const newCancelToken = useCancelToken()

  useEffect(() => {
    if (!accountId) return

    async function fetchSalesAndRevenue() {
      try {
        setIsLoading(true)

        const { totalOrders, totalRevenue, results } =
          await getUserSalesAndRevenue(accountId, chainIds, filters)

        const enrichedResults = await Promise.all(
          results.map(async (item) => {
            try {
              const accessDetails = await getAccessDetails(
                item.credentialSubject.chainId,
                item.credentialSubject.services[0],
                accountId,
                newCancelToken()
              )

              return {
                ...item,
                accessDetails
              }
            } catch (err) {
              LoggerInstance.warn(
                `Failed to fetch access details for ${item.id}`,
                err.message
              )
              return { ...item, accessDetails: [] }
            }
          })
        )

        setSales(totalOrders)
        setRevenue(totalRevenue)
        setAllAssets(enrichedResults)
      } catch (error) {
        LoggerInstance.error(
          'Failed to fetch user sales/revenue',
          error.message
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesAndRevenue()
  }, [accountId, chainIds, filters])

  const getPublished = useDebouncedCallback(
    async (
      accountId: string,
      chainIds: number[],
      page: number,
      filters: Filters,
      ignorePurgatory: boolean,
      cancelToken: CancelToken
    ) => {
      try {
        setIsLoading(true)
        const result = await getPublishedAssets(
          accountId.toLowerCase(),
          chainIds,
          cancelToken,
          ownAccount && ignorePurgatory,
          ownAccount,
          filters,
          page
        )
        const updatedResults = await Promise.all(
          result.results.map(async (item) => {
            const accessDetails = await getAccessDetails(
              item.credentialSubject.chainId,
              item.credentialSubject.services[0],
              accountId,
              newCancelToken()
            )

            return {
              ...item,
              accessDetails
            }
          })
        )
        setQueryResult({
          ...result,
          results: updatedResults
        })
      } catch (error) {
        LoggerInstance.error(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    500
  )

  useEffect(() => {
    if (queryResult && queryResult.totalPages < page) setPage(1)
  }, [page, queryResult])

  useEffect(() => {
    if (!accountId) return
    getPublished(
      accountId,
      chainIds,
      page,
      filters,
      ignorePurgatory,
      newCancelToken()
    )
  }, [
    accountId,
    ownAccount,
    page,
    appConfig?.metadataCacheUri,
    chainIds,
    newCancelToken,
    getPublished,
    filters,
    ignorePurgatory
  ])

  return accountId ? (
    <div className={styles.containerHistory}>
      <div className={styles.filterContainer}>
        <Filter showPurgatoryOption={ownAccount} expanded showTime />
      </div>
      {queryResult && (
        <div className={styles.tableContainer}>
          {queryResult?.results.length > 0 ? (
            <HistoryTable
              columns={columns}
              data={queryResult.results}
              paginationPerPage={9}
              isLoading={isLoading}
              emptyMessage={
                chainIds.length === 0 ? 'No network selected' : null
              }
              exportEnabled={true}
              onPageChange={(newPage) => {
                setPage(newPage)
              }}
              showPagination
              page={queryResult?.page > 0 ? queryResult?.page - 1 : 1}
              totalPages={queryResult?.totalPages}
              revenue={revenue}
              sales={sales}
              items={queryResult?.totalResults}
              allResults={allAssets}
            />
          ) : (
            <div className={styles.empty}>No results found</div>
          )}
        </div>
      )}
    </div>
  ) : (
    <div>Please connect your wallet.</div>
  )
}
