export enum SortDirectionOptions {
  Ascending = 'asc',
  Descending = 'desc'
}

export enum SortTermOptions {
  Created = 'nft.created',
  Relevance = '_score',
  Orders = 'stats.orders',
  Allocated = 'stats.allocated',
  Price = 'stats.price.value'
}

// Note: could not figure out how to get `enum` to be ambiant
// as final compiled js won't have it then.
// Only export/import works for that, so this file is NOT .d.ts file ending
// and gets imported in components.

export enum FilterOptions {
  AccessType = 'accessType',
  ServiceType = 'serviceType'
}

export enum FilterByTypeOptions {
  Data = 'dataset',
  Algorithm = 'algorithm',
  Saas = 'saas'
}

export enum FilterByAccessOptions {
  Download = 'access',
  Compute = 'compute'
}

export enum FILTER_VALUES {
  MUST_EXIST = 'MUST_EXIST', // checks if the queryPath exists
  MUST_EXISTS_AND_NON_EMPTY = 'MUST_EXISTS_AND_NON_EMPTY' // checks if the queryPath exists and is not empty
}

declare global {
  interface SortOptions {
    sortBy: SortTermOptions
    sortDirection?: SortDirectionOptions
  }

  interface FilterTerm {
    [property: string]: {
      [property: string]: string | number | boolean | number[] | string[]
    }
  }

  type Filters = FilterByTypeOptions | FilterByAccessOptions

  interface SearchQuery {
    from?: number
    size?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: any
    sort?: { [jsonPath: string]: SortDirectionOptions }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aggs?: any
  }
}
