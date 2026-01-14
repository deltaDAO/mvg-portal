'use client'

import {
  createClient,
  Provider,
  Client,
  dedupExchange,
  fetchExchange
} from 'urql'
import { refocusExchange } from '@urql/exchange-refocus'
import { useState, useEffect, ReactNode, ReactElement } from 'react'
import { LoggerInstance } from '@oceanprotocol/lib'
import { getOceanConfig } from '@utils/ocean'
import { useChainId } from 'wagmi'

let urqlClient: Client

function createUrqlClient(subgraphUri: string) {
  return createClient({
    url: `${subgraphUri}/subgraphs/name/oceanprotocol/ocean-subgraph`,
    exchanges: [dedupExchange, refocusExchange(), fetchExchange]
  })
}

export function getUrqlClientInstance(): Client {
  return urqlClient
}

export default function UrqlClientProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const [client, setClient] = useState<Client>()
  const chainId = useChainId() // wagmi v2 hook

  useEffect(() => {
    if (!chainId) {
      LoggerInstance.error('No chainId found. Cannot create URQL client.')
      return
    }

    const oceanConfig = getOceanConfig(chainId)

    if (!oceanConfig?.nodeUri) {
      LoggerInstance.error(`[URQL] No nodeUri defined for chain ${chainId}.`)
      return
    }

    const newClient = createUrqlClient(oceanConfig.nodeUri)
    urqlClient = newClient
    setClient(newClient)
  }, [chainId]) // re-run when chain changes

  return client ? <Provider value={client}>{children}</Provider> : <></>
}

export { UrqlClientProvider }
