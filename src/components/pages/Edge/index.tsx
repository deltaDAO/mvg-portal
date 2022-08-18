import React, { ReactElement, useEffect, useState } from 'react'
import Permission from '../../organisms/Permission'
import AssetList from '../../organisms/AssetList'
import styles from './index.module.css'
import {
  SortDirectionOptions,
  SortOptions,
  SortTermOptions
} from '../../../models/SortAndFilters'
import { BaseQueryParams } from '../../../models/aquarius/BaseQueryParams'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '../../../utils/aquarius'
import { PagedAssets } from '../../../models/PagedAssets'
import { useCancelToken } from '../../../hooks/useCancelToken'
import { useUserPreferences } from '../../../providers/UserPreferences'

export default function EdgePage(): ReactElement {
  const { chainIds } = useUserPreferences()
  const [queryResult, setQueryResult] = useState<PagedAssets>()
  const [isLoading, setIsLoading] = useState(false)
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const baseParams = {
        chainIds,
        filters: [getFilterTerm('service.attributes.main.type', 'thing')],
        sortOptions: {
          sortBy: SortTermOptions.Created,
          sortDirection: SortDirectionOptions.Ascending
        } as SortOptions
      } as BaseQueryParams
      try {
        const query = generateBaseQuery(baseParams, { includeThings: true })
        setQueryResult(await queryMetadata(query, newCancelToken()))
      } catch (error) {
        console.log(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [chainIds, newCancelToken])

  return (
    <Permission eventType="browse">
      <div className={styles.results}>
        <AssetList
          assets={queryResult?.results}
          showPagination
          isLoading={isLoading}
          page={queryResult?.page}
          totalPages={queryResult?.totalPages}
        />
      </div>
    </Permission>
  )
}
