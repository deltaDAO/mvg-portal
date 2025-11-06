export interface UserParameter {
  name: string
  label: string
  description?: string
  type: string
  default?: string
  required?: boolean
}

export interface DatasetService {
  serviceId: string
  serviceName: string
  serviceDescription: string
  serviceType: string
  serviceDuration: number
  price: number
  tokenSymbol: string
  checked: boolean
  isAccountIdWhitelisted: boolean
  datetime: string
  userParameters?: UserParameter[]
}

export interface DatasetItem {
  did: string
  name: string
  symbol: string
  description?: string
  datasetPrice: number
  expanded: boolean
  checked: boolean
  services: DatasetService[]
}
