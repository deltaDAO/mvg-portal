import { LoggerInstance } from '@oceanprotocol/lib'
import React, { ReactElement, useEffect, useState, useCallback } from 'react'
import AssetList from '@shared/AssetList'
import { getPublishedAssets } from '@utils/aquarius'
import { useUserPreferences } from '@context/UserPreferences'
import styles from './PublishedList.module.css'
import { useCancelToken } from '@hooks/useCancelToken'
import Filter from '@components/Search/Filter'
import { useMarketMetadata } from '@context/MarketMetadata'
import { CancelToken } from 'axios'
import { useProfile } from '@context/Profile'
import { useFilter, Filters } from '@context/Filter'
import { useDebouncedCallback } from 'use-debounce'

export default function PublishedList({
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
  const newCancelToken = useCancelToken()

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
        setQueryResult(result)
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
    <div className={styles.container}>
      <div className={styles.filterContainer}>
        <Filter showPurgatoryOption={ownAccount} expanded />
      </div>
      <div className={styles.results}>
        <AssetList
          assets={queryResult?.results}
          isLoading={isLoading}
          showPagination
          page={queryResult?.page}
          totalPages={queryResult?.totalPages}
          onPageChange={(newPage) => {
            setPage(newPage)
          }}
          noPublisher
          showAssetViewSelector
        />
      </div>
    </div>
  ) : (
    <div>Please connect your wallet.</div>
  )
}
