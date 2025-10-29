import {
  createClient,
  Provider,
  Client,
  dedupExchange,
  fetchExchange
} from 'urql'
import { refocusExchange } from '@urql/exchange-refocus'
import { ReactNode, ReactElement } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'

let urqlClient: Client | undefined

function createUrqlClient(subgraphUri: string) {
  const client = createClient({
    url: `${subgraphUri}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    exchanges: [dedupExchange, refocusExchange(), fetchExchange]
  })
  return client
}

export function getUrqlClientInstance(): Client {
  return urqlClient as Client
}

// Initialize at module load to be available during SSR
try {
  const oceanConfig = getOceanConfig(1)
  if (!oceanConfig?.subgraphUri) {
    LoggerInstance.error(
      'No subgraphUri defined, preventing UrqlProvider from initialization.'
    )
  } else {
    urqlClient = createUrqlClient(oceanConfig.subgraphUri)
    LoggerInstance.log(`[URQL] Client connected to ${oceanConfig.subgraphUri}`)
  }
} catch (e) {
  LoggerInstance.error('Failed to initialize URQL client', (e as any)?.message)
}

export default function UrqlClientProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  return urqlClient ? (
    <Provider value={urqlClient}>{children}</Provider>
  ) : (
    <>{children}</>
  )
}

export { UrqlClientProvider }
