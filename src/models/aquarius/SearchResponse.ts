/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import { DDO } from '@oceanprotocol/lib'

export interface Explanation {
  value: number
  description: string
  details: Explanation[]
}
export interface ShardsResponse {
  total: number
  successful: number
  failed: number
  skipped: number
}

export interface SearchResponse {
  took: number
  timed_out: boolean
  _scroll_id?: string | undefined
  _shards: ShardsResponse
  hits: {
    total: number
    max_score: number
    hits: Array<{
      _index: string
      _type: string
      _id: string
      _score: number
      _source: DDO
      _version?: number | undefined
      _explanation?: Explanation | undefined
      fields?: any
      highlight?: any
      inner_hits?: any
      matched_queries?: string[] | undefined
      sort?: string[] | undefined
    }>
  }
  aggregations?: any
}
