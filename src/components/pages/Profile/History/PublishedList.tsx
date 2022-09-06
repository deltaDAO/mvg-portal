import { Logger } from '@oceanprotocol/lib'
import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import AssetList from '../../../organisms/AssetList'
import { getPublishedAssets } from '../../../../utils/aquarius'
import Filters from '../../../templates/Search/Filters'
import { useSiteMetadata } from '../../../../hooks/useSiteMetadata'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import styles from './PublishedList.module.css'
import { useCancelToken } from '../../../../hooks/useCancelToken'
import { PagedAssets } from '../../../../models/PagedAssets'
import {
  FilterByAccessOptions,
  FilterByTypeOptions
} from '../../../../models/SortAndFilters'
import { CancelToken } from 'axios'

export default function PublishedList({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { appConfig } = useSiteMetadata()
  const { chainIds } = useUserPreferences()

  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState<number>(1)
  const [serviceType, setServiceType] = useState<FilterByTypeOptions[]>([])
  const [accessType, setAccessType] = useState<FilterByAccessOptions[]>([])
  const newCancelToken = useCancelToken()

  const getPublished = useCallback(
    async (
      accountId: string,
      chainIds: number[],
      cancelToken: CancelToken,
      page?: number,
      serviceType?: FilterByTypeOptions[],
      accessType?: FilterByAccessOptions[]
    ) => {
      try {
        setIsLoading(true)
        const result = await getPublishedAssets(
          accountId.toLowerCase(),
          chainIds,
          cancelToken,
          page,
          serviceType,
          accessType
        )
        setQueryResult(result)
      } catch (error) {
        Logger.error(error.message)
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (queryResult && queryResult.totalPages < page) setPage(1)
  }, [page, queryResult])

  useEffect(() => {
    if (!accountId) return

    getPublished(
      accountId,
      chainIds,
      newCancelToken(),
      page,
      serviceType,
      accessType
    )
  }, [
    accountId,
    page,
    appConfig.metadataCacheUri,
    chainIds,
    newCancelToken,
    getPublished,
    serviceType,
    accessType
  ])

  return accountId ? (
    <>
      <div className={styles.header}>
        <Filters
          serviceType={serviceType}
          setServiceType={setServiceType}
          accessType={accessType}
          setAccessType={setAccessType}
          className={styles.filters}
        />
      </div>
      <AssetList
        assets={queryResult?.results}
        isLoading={isLoading}
        showPagination
        page={queryResult?.page}
        totalPages={queryResult?.totalPages}
        onPageChange={(newPage) => {
          setPage(newPage)
        }}
        className={styles.assets}
        noPublisher
      />
    </>
  ) : (
    <div>Please connect your Web3 wallet.</div>
  )
}
