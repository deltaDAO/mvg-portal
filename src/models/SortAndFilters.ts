export enum SortDirectionOptions {
  Ascending = 'asc',
  Descending = 'desc'
}

export enum SortTermOptions {
  Created = 'created',
  Relevance = '_score'
}

export enum FilterOptions {
  AccessType = 'accessType',
  ServiceType = 'serviceType'
}

export enum FilterByTypeOptions {
  Data = 'dataset',
  Algorithm = 'algorithm',
  Edge = 'thing'
}

export enum FilterByAccessOptions {
  Download = 'access',
  Compute = 'compute'
}

export interface SortOptions {
  sortBy: SortTermOptions
  sortDirection?: SortDirectionOptions
}

export type Filters = FilterByTypeOptions | FilterByAccessOptions
