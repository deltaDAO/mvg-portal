import { LoggerInstance } from '@oceanprotocol/lib'
import {
  escapeEsReservedCharacters,
  generateBaseQuery,
  getFilter,
  getFilterTerm,
  parseFilters,
  queryMetadata
} from '@utils/aquarius'
import queryString from 'query-string'
import { CancelToken } from 'axios'
import {
  FILTER_VALUES,
  FilterByAccessOptions,
  FilterByTypeOptions,
  SortDirectionOptions,
  SortTermOptions
} from '../../@types/aquarius/SearchQuery'
import { filterSets, getInitialFilters } from './Filter'

export function updateQueryStringParameter(
  uri: string,
  key: string,
  newValue: string
): string {
  const regex = new RegExp('([?&])' + key + '=.*?(&|$)', 'i')
  const separator = uri.indexOf('?') !== -1 ? '&' : '?'

  if (uri.match(regex)) {
    return uri.replace(regex, '$1' + key + '=' + newValue + '$2')
  } else {
    return uri + separator + key + '=' + newValue
  }
}

export function getSearchQuery(
  chainIds: number[],
  text?: string,
  owner?: string,
  tags?: string,
  page?: string,
  offset?: string,
  sort?: string,
  sortDirection?: string,
  serviceType?: string | string[],
  accessType?: string | string[],
  filterSet?: string | string[],
  showSaas?: boolean,
  gaiax?: string | string[],
  custom?: string | string[]
): SearchQuery {
  text = escapeEsReservedCharacters(text)
  const emptySearchTerm = text === undefined || text === ''
  const filters: FilterTerm[] = []
  const boolFilter: BoolFilter<string>[] = []
  const filterList = [filterSet, gaiax, custom, accessType, serviceType]
  const checkMustExists = () => {
    return filterList.some((filter) => {
      let isValueMustExist =
        filter?.includes(FILTER_VALUES.MUST_EXIST) ||
        filter?.includes(FILTER_VALUES.MUST_EXISTS_AND_NON_EMPTY)
      const isArray = typeof filter !== 'string'
      if (isArray) {
        isValueMustExist = filter?.some((term) => {
          console.log(term)
          return (
            term.includes(FILTER_VALUES.MUST_EXIST) ||
            term.includes(FILTER_VALUES.MUST_EXISTS_AND_NON_EMPTY)
          )
        })
      }

      if (isValueMustExist) {
        console.log(filter, 'true')
        return true
      }
      console.log(filter, 'false')
      return false
    })
  }
  const searchTerm = text || ''
  let nestedQuery
  const getSearchTerm = (searchTerm: string) => {
    searchTerm = searchTerm.trim()
    const modifiedSearchTerm = searchTerm.split(' ').join(' OR ').trim()
    const noSpaceSearchTerm = searchTerm.split(' ').join('').trim()

    const prefixedSearchTerm =
      emptySearchTerm && searchTerm
        ? searchTerm
        : !emptySearchTerm && searchTerm
        ? '*' + searchTerm + '*'
        : '**'
    const searchFields = [
      'id',
      'nft.owner',
      'datatokens.address',
      'datatokens.name',
      'datatokens.symbol',
      'metadata.name^10',
      'metadata.author',
      'metadata.description',
      'metadata.tags'
    ]

    nestedQuery = {
      must: [
        {
          bool: {
            should: [
              {
                query_string: {
                  query: `${modifiedSearchTerm}`,
                  fields: searchFields,
                  minimum_should_match: '2<75%',
                  phrase_slop: 2,
                  boost: 5
                }
              },
              {
                query_string: {
                  query: `${noSpaceSearchTerm}*`,
                  fields: searchFields,
                  boost: 5,
                  lenient: true
                }
              },
              {
                match_phrase: {
                  content: {
                    query: `${searchTerm}`,
                    boost: 10
                  }
                }
              },
              {
                query_string: {
                  query: `${prefixedSearchTerm}`,
                  fields: searchFields,
                  default_operator: 'AND'
                }
              }
            ]
          }
        }
      ]
    }
  }
  const getMustExistFilter = (filter: string) => {
    if (
      filter.includes(FILTER_VALUES.MUST_EXIST) ||
      filter.includes(FILTER_VALUES.MUST_EXISTS_AND_NON_EMPTY)
    ) {
      const filters = getFilter(filter)
      filters.forEach((term) => {
        const query = {
          bool: {
            ...term
          }
        }
        boolFilter.push(query)
      })
    } else {
      getSearchTerm(searchTerm)
    }
  }
  if (tags) {
    filters.push(getFilterTerm('metadata.tags.keyword', tags))
  } else if (!checkMustExists()) {
    getSearchTerm(searchTerm)
  } else {
    for (const filters of filterList) {
      if (typeof filters !== 'undefined') {
        const isArray = typeof filters !== 'string'
        if (isArray) {
          for (const filter of filters) {
            getMustExistFilter(filter)
          }
        } else {
          getMustExistFilter(filters)
        }
      }
    }
  }

  const filtersList = getInitialFilters(
    { accessType, serviceType, filterSet, gaiax, custom },
    ['accessType', 'serviceType', 'filterSet', 'gaiax', 'custom']
  )
  parseFilters(filtersList, filterSets).forEach((term) => filters.push(term))

  const baseQueryParams = {
    chainIds,
    nestedQuery,
    esPaginationOptions: {
      from: (Number(page) - 1 || 0) * (Number(offset) || 21),
      size: Number(offset) || 21
    },
    sortOptions: { sortBy: sort, sortDirection },
    filters,
    boolFilter,
    showSaas
  } as BaseQueryParams

  const query = generateBaseQuery(baseQueryParams)
  return query
}

export async function getResults(
  params: {
    text?: string
    owner?: string
    tags?: string
    categories?: string
    page?: string
    offset?: string
    sort?: string
    sortOrder?: string
    serviceType?: string | string[]
    accessType?: string | string[]
    filterSet?: string[]
    gaiax?: string | string[]
    custom?: string | string[]
  },
  chainIds: number[],
  cancelToken?: CancelToken
): Promise<PagedAssets> {
  const {
    text,
    owner,
    tags,
    page,
    offset,
    sort,
    sortOrder,
    serviceType,
    accessType,
    filterSet,
    gaiax
  } = params

  const showSaas =
    serviceType === undefined
      ? undefined
      : serviceType === 'metadata.type=' + FilterByTypeOptions.Saas ||
        (typeof serviceType !== 'string' &&
          serviceType.includes('metadata.type=' + FilterByTypeOptions.Saas))
  // we make sure to query only for service types that are expected
  // by Aqua ("dataset" or "algorithm") by removing "saas"
  const sanitizedServiceType =
    serviceType !== undefined && typeof serviceType !== 'string'
      ? serviceType.filter(
          (type) => type !== 'metadata.type=' + FilterByTypeOptions.Saas
        )
      : serviceType === 'metadata.type=' + FilterByTypeOptions.Saas
      ? undefined
      : serviceType

  const searchQuery = getSearchQuery(
    chainIds,
    text,
    owner,
    tags,
    page,
    offset,
    sort,
    sortOrder,
    sanitizedServiceType,
    accessType,
    filterSet,
    showSaas,
    gaiax
  )

  const queryResult = await queryMetadata(searchQuery, cancelToken)

  // update queryResult to workaround the wrong return datatype of totalPages and totalResults
  return queryResult?.results?.length === 0
    ? {
        ...queryResult,
        totalPages: 0,
        totalResults: 0
      }
    : queryResult
}

export async function addExistingParamsToUrl(
  location: Location,
  excludedParams: string[]
): Promise<string> {
  const parsed = queryString.parse(location.search)
  let urlLocation = '/search?'
  if (Object.keys(parsed).length > 0) {
    for (const queryParam in parsed) {
      if (!excludedParams.includes(queryParam)) {
        if (queryParam === 'page' && excludedParams.includes('text')) {
          LoggerInstance.log('remove page when starting a new search')
        } else {
          const value = parsed[queryParam]
          urlLocation = `${urlLocation}${queryParam}=${value}&`
        }
      }
    }
  } else {
    // sort should be relevance when fixed in aqua
    urlLocation = `${urlLocation}sort=${encodeURIComponent(
      SortTermOptions.Created
    )}&sortOrder=${SortDirectionOptions.Descending}&`
  }
  urlLocation = urlLocation.slice(0, -1)
  return urlLocation
}
