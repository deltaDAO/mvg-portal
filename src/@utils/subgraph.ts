import { gql, OperationResult, TypedDocumentNode, OperationContext } from 'urql'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getUrqlClientInstance } from '@context/UrqlProvider'
import { getOceanConfig } from './ocean'
import { OrdersData_orders as OrdersData } from '../@types/subgraph/OrdersData'
import { OpcFeesQuery as OpcFeesData } from '../@types/subgraph/OpcFeesQuery'
import appConfig from '../../app.config'
import { generateBaseQuery, getFilterTerm, queryMetadata } from './aquarius'
import { SortDirectionOptions, SortTermOptions } from 'src/@types/aquarius/SearchQuery'
import axios, { CancelToken } from 'axios'

export function generateComputeOrdersQueryByDatatokenAddress(datatokenAddress: string, accountId: string): SearchQuery {
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

const UserTokenOrders = gql`
  query OrdersData($user: String!) {
    orders(orderBy: createdTimestamp, orderDirection: desc, where: { consumer: $user }) {
      consumer {
        id
      }
      datatoken {
        id
        address
        symbol
      }
      consumerMarketToken {
        address
        symbol
      }
      createdTimestamp
      tx
    }
  }
`

const OpcFeesQuery = gql`
  query OpcFeesQuery($id: ID!) {
    opc(id: $id) {
      swapOceanFee
      swapNonOceanFee
      orderFee
      providerFee
    }
  }
`

const OpcsApprovedTokensQuery = gql`
  query OpcsApprovedTokensQuery {
    opcs {
      approvedTokens {
        address: id
        symbol
        name
        decimals
      }
    }
  }
`

export function getSubgraphUri(chainId: number): string {
  const config = getOceanConfig(chainId)
  return config.subgraphUri
}

export function getQueryContext(chainId: number): OperationContext {
  console.log('heeee5')
  try {
    if (!appConfig.chainIdsSupported.includes(chainId)) throw Object.assign(new Error('network not supported, query context cancelled'))

    const queryContext: OperationContext = {
      url: `${getSubgraphUri(Number(chainId))}/subgraphs/name/oceanprotocol/ocean-subgraph`,
      requestPolicy: 'network-only'
    }
    return queryContext
  } catch (error) {
    LoggerInstance.error('Get query context error: ', error.message)
  }
}

export async function fetchData(query: TypedDocumentNode, variables: any, context: OperationContext): Promise<any> {
  console.log('heeee4')
  try {
    const client = getUrqlClientInstance()

    const response = await client.query(query, variables, context).toPromise()
    console.log('responseeeeee', response)
    return response
  } catch (error) {
    console.log('catchchch', error)
    LoggerInstance.error('Error fetchData: ', error.message)
  }
  console.log('response null')
  return null
}

export async function fetchData2(
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
    LoggerInstance.error('Error fetching data using queryMetadata:', error.message)
  }
  return null
}

export async function fetchDataForMultipleChains(query: SearchQuery, variables: any, cancelToken: CancelToken): Promise<any[]> {
  try {
    const response = await fetchData2(query, variables, cancelToken)

    return response.results // Return the combined data
  } catch (error) {
    LoggerInstance.error('Error fetching data for multiple chains:', error.message)
    return []
  }
}

export async function getOpcFees(chainId: number) {
  console.log('heeee2')
  let opcFees
  const variables = {
    id: 1
  }
  const context = getQueryContext(chainId)
  try {
    const response: OperationResult<OpcFeesData> = await fetchData(OpcFeesQuery, variables, context)
    opcFees = response?.data?.opc
  } catch (error) {
    LoggerInstance.error('Error getOpcFees: ', error.message)
    throw Error(error.message)
  }
  return opcFees
}

export function generateUserTokenOrdersQuery(accountId: string, chainIds: number[]): SearchQuery {
  const baseQueryParams = {
    chainIds,
    filters: [
      // Filter by the consumer (user account) for token orders
      getFilterTerm('services.consumer', accountId.toLowerCase())
    ],
    sortOptions: {
      sortBy: SortTermOptions.Created, // Use the enum value here
      sortDirection: SortDirectionOptions.Descending
    },
    esPaginationOptions: {
      from: 0,
      size: 1000 // Adjust size if needed
    }
  } as BaseQueryParams

  return generateBaseQuery(baseQueryParams)
}

export async function getUserTokenOrders(accountId: string, chainIds: number[], cancelToken: CancelToken): Promise<OrdersData[]> {
  const data: OrdersData[] = []

  try {
    // Generate the query to get user token orders
    const query = generateUserTokenOrdersQuery(accountId, chainIds)
    console.log('query:', query)
    // Execute the query using queryMetadata
    const result = await queryMetadata(query, cancelToken)
    console.log('resuls:,result', result)
    // Extract orders from the results
    result?.results?.forEach((tokenOrder: OrdersData) => {
      data.push(tokenOrder)
    })

    console.log('User token orders:', data)
    return data
  } catch (error) {
    if (axios.isCancel(error)) {
      LoggerInstance.log(error.message)
    } else {
      LoggerInstance.error('Error fetching user token orders:', error.message)
    }
  }
}

// export async function getUserTokenOrders(
//   accountId: string,
//   chainIds: number[]
// ): Promise<OrdersData[]> {
//   const data: OrdersData[] = []
//   const variables = { user: accountId?.toLowerCase() }

//   try {
//     const tokenOrders = await fetchDataForMultipleChains(
//       UserTokenOrders,
//       variables,
//       chainIds
//     )
//     console.log('tokenOrders:', tokenOrders)
//     for (let i = 0; i < tokenOrders?.length; i++) {
//       tokenOrders[i].orders.forEach((tokenOrder: OrdersData) => {
//         data.push(tokenOrder)
//       })
//     }
//     console.log('data:', data)
//     return data
//   } catch (error) {
//     LoggerInstance.error('Error getUserTokenOrders', error.message)
//   }
// }

export async function getOpcsApprovedTokens(chainId: number): Promise<TokenInfo[]> {
  const context = getQueryContext(chainId)
  console.log('heeee1')
  const tokenAddressesEUROe = {
    100: '0xe974c4894996e012399dedbda0be7314a73bbff1',
    137: '0x820802Fa8a99901F52e39acD21177b0BE6EE2974',
    80001: '0xA089a21902914C3f3325dBE2334E9B466071E5f1'
  }

  try {
    const response = await fetchData(OpcsApprovedTokensQuery, null, context)
    if (!response?.data) return

    // TODO: remove the mocked EUROe integration
    const { approvedTokens } = response.data.opcs[0]
    if (!Object.keys(tokenAddressesEUROe).includes(chainId.toString())) return approvedTokens

    return approvedTokens.includes((token) => token.address === tokenAddressesEUROe[chainId])
      ? approvedTokens
      : [
          ...approvedTokens,
          {
            address: tokenAddressesEUROe[chainId],
            decimals: 6,
            name: 'EUROe',
            symbol: 'EUROe'
          }
        ]
  } catch (error) {
    LoggerInstance.error('Error getOpcsApprovedTokens: ', error.message)
    throw Error(error.message)
  }
}
