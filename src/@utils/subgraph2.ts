import { LoggerInstance } from '@oceanprotocol/lib'
import { OrdersData_orders as OrdersData } from '../@types/subgraph/OrdersData'

import { generateBaseQuery, getFilterTerm, queryMetadata } from './aquarius'
import axios, { CancelToken } from 'axios'

export function generateComputeOrdersQueryByDatatokenAddress(
  datatokenAddress: string,
  accountId: string
): SearchQuery {
  return {
    query: {
      bool: {
        must: [
          {
            term: {
              'services.datatokenAddress': datatokenAddress.toLowerCase()
            }
          },
          { term: { 'services.consumer': accountId.toLowerCase() } }
        ]
      }
    }
  }
}

// Generate query by account ID
export function generateComputeOrdersQuery(accountId: string): SearchQuery {
  return {
    query: {
      bool: {
        must: [{ term: { 'services.consumer': accountId.toLowerCase() } }]
      }
    }
  }
}

export async function fetchData(
  query: SearchQuery, // Adjust to use the correct type (SearchQuery)
  variables: any, // You can pass in variables as needed, but we'll assume they can be embedded into the query
  cancelToken: CancelToken // Add CancelToken for queryMetadata
): Promise<any> {
  console.log('Fetching data using queryMetadata')
  try {
    // Use queryMetadata instead of urql client to fetch the data
    const result = await queryMetadata(query, cancelToken)
    console.log('response after query metadata', result)
    return result // Return the result
  } catch (error) {
    LoggerInstance.error(
      'Error fetching data using queryMetadata:',
      error.message
    )
  }
  return null
}

export async function fetchDataForMultipleChains(
  query: any,
  variables: any,
  cancelToken: CancelToken
): Promise<any[]> {
  try {
    const response = await fetchData(query, variables, cancelToken)
    return response.results // Return the combined data
  } catch (error) {
    LoggerInstance.error(
      'Error fetching data for multiple chains:',
      error.message
    )
    return []
  }
}

export function generateUserTokenOrdersQuery(
  accountId: string,
  chainIds: number[]
): SearchQuery {
  // TODO not work filter, i don't know the term
  const baseQueryParams = {
    chainIds,
    filters: [
      // Filter by the consumer (user account) for token orders
      getFilterTerm('consumer.id', accountId.toLowerCase())
    ],
    esPaginationOptions: {
      from: 0,
      size: 1000
    }
  } as BaseQueryParams

  return generateBaseQuery(baseQueryParams)
}

export async function getUserTokenOrders(
  accountId: string,
  chainIds: number[],
  cancelToken: CancelToken
): Promise<OrdersData[]> {
  const data: OrdersData[] = []

  try {
    const query = generateUserTokenOrdersQuery(accountId, chainIds)
    const result = await queryMetadata(query, cancelToken)
    result?.results?.forEach((tokenOrder: OrdersData) => {
      data.push(tokenOrder)
    })

    return data
  } catch (error) {
    if (axios.isCancel(error)) {
      LoggerInstance.log(error.message)
    } else {
      LoggerInstance.error('Error fetching user token orders:', error.message)
    }
  }
}
