interface EsPaginationOptions {
  from?: number
  size?: number
}

interface BoolFilter {
  bool: BoolFilterQuery
}

interface BoolFilterQuery {
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

interface BaseQueryParams {
  chainIds: number[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nestedQuery?: any
  esPaginationOptions?: EsPaginationOptions
  sortOptions?: SortOptions
  aggs?: any
  filters?: FilterTerm[]
  boolFilter?: BoolFilter[]
  ignorePurgatory?: boolean
  ignoreState?: boolean
  showSaas?: boolean
}
