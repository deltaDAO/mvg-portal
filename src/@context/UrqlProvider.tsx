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
  return createClient({
    url: `${subgraphUri}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    exchanges: [dedupExchange, refocusExchange(), fetchExchange]
  })
}

// Initialize synchronously for SSR so markup is consistent across server/client
;(() => {
  try {
    const oceanConfig = getOceanConfig(1)
    if (!oceanConfig?.subgraphUri) {
      LoggerInstance.error(
        'No subgraphUri defined, preventing UrqlProvider initialization.'
      )
      return
    }
    urqlClient = createUrqlClient(oceanConfig.subgraphUri)
    LoggerInstance.log(`[URQL] Client connected to ${oceanConfig.subgraphUri}`)
  } catch (e) {
    LoggerInstance.error('Failed to initialize URQL client', e?.message || e)
  }
})()

export function getUrqlClientInstance(): Client {
  // Consumers expect a client; if not initialized, throw to surface misconfig
  if (!urqlClient)
    throw new Error(
      'URQL client not initialized. Check subgraph configuration.'
    )
  return urqlClient
}

export default function UrqlClientProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  if (!urqlClient) return <>{children}</> // Render children to avoid SSR blank output

  return <Provider value={urqlClient}>{children}</Provider>
}

export { UrqlClientProvider }
