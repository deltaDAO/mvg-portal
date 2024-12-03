interface EsPaginationOptions {
  from?: number
  size?: number
}

type FieldPath = string

interface BoolFilter<T extends FieldPath> {
  bool: MustExistQuery<T> & MustNotTermQuery<T>
}

interface MustExistQuery<T extends FieldPath> {
  must: {
    exists: {
      field: T
    }
  }
}

interface MustNotTermQuery<T extends FieldPath> {
  must_not?: {
    term: {
      [field in T]: string
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
  boolFilter?: BoolFilter
  ignorePurgatory?: boolean
  ignoreState?: boolean
  showSaas?: boolean
}
