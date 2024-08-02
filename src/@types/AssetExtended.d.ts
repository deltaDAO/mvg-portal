import { Asset } from '@oceanprotocol/lib'

// declaring into global scope to be able to use this as
// ambiant types despite the above imports
declare global {
  interface ServicePrice {
    type: 'fixedrate' | 'dispenser'
    price: string
    contract: string
    token?: TokenInfo
    exchangeId?: string
  }

  interface ServiceStat {
    datatokenAddress: string
    name: string
    symbol: string
    serviceId: string
    orders: number
    prices: ServicePrice[]
  }

  interface OffChain {
    stats: {
      services: ServiceStat[]
    }
  }

  interface AssetExtended extends Asset {
    accessDetails?: AccessDetails[]
    views?: number
    metadata: MetadataExtended
    services: ServiceExtended[]
    offchain?: OffChain // TODO - in future it will be directly included in Asset type in @oceanprotocol/lib
  }
}
