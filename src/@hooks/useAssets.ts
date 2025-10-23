import { useSuspenseQuery } from '@tanstack/react-query'
import {
  generateBaseQuery,
  getFilterTerm,
  queryMetadata
} from '@utils/aquarius'
import {
  SortDirectionOptions,
  SortTermOptions
} from '../@types/aquarius/SearchQuery'
import { useCancelToken } from './useCancelToken'

export const useAssets = (
  address: string,
  type: 'algorithm' | 'dataset',
  chainId: number
) => {
  const newCancelToken = useCancelToken()

  const filters = [] as FilterTerm[]

  filters.push(getFilterTerm('metadata.type', type))
  filters.push(getFilterTerm('nft.state', [0, 4, 5]))
  filters.push(getFilterTerm('nft.owner', address.toLowerCase()))
  filters.push(getFilterTerm('services.type', 'compute'))

  const baseQueryParams = {
    chainIds: [chainId],
    filters,
    sortOptions: {
      sortBy: SortTermOptions.Created,
      sortDirection: SortDirectionOptions.Descending
    },
    ignorePurgatory: true,
    esPaginationOptions: {
      from: 0,
      size: 9
    }
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryParams)

  return useSuspenseQuery({
    queryKey: [type, address],
    queryFn: async () => await queryMetadata(query, newCancelToken())
  })
}
