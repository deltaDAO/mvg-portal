interface EsPaginationOptions {
  from?: number
  size?: number
}

interface boolFilter {
  bool: {
    must: {
      exists: {
        field: string
      }
    }
    must_not?: {
      term: {
        [key: string]: string
      }
    }
  }
}

interface BaseQueryParams {
  chainIds: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nestedQuery?: any
  esPaginationOptions?: EsPaginationOptions
  sortOptions?: SortOptions
  aggs?: any
  filters?: FilterTerm[]
  bool?: boolFilter[]
  ignorePurgatory?: boolean
  ignoreState?: boolean
  showSaas?: boolean
}
