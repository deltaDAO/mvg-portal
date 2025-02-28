import { Asset } from './Asset'

export interface ServicePrice {
  type: 'fixedrate' | 'dispenser'
  price: string
  contract: string
  token?: TokenInfo
  exchangeId?: string
}

export interface ServiceStat {
  datatokenAddress: string
  name: string
  symbol: string
  serviceId: string
  orders: number
  prices: ServicePrice[]
}

export interface OffChain {
  stats: {
    services: ServiceStat[]
  }
}

export interface AssetExtended extends Asset {
  datatokens?: any
  chainId?: number
  metadata?: any
  accessDetails?: AccessDetails[]
  views?: number
  offchain?: OffChain // TODO - in future it will be directly included in Asset type in @oceanprotocol/lib
}
