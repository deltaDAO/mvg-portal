// hooks/useEthersSigner.ts
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useMemo } from 'react'
import type { Client, Transport, Chain, Account } from 'viem'
import { type Config, useChainId, useConnectorClient } from 'wagmi'

function clientToSigner(
  client: Client<Transport, Chain, Account>
): JsonRpcSigner {
  const { account, chain, transport } = client as any
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  }

  const provider = new BrowserProvider(transport, network)
  const signer = new JsonRpcSigner(provider, account?.address)

  return signer
}

export function useEthersSigner() {
  const chainId = useChainId()
  const { data } = useConnectorClient<Config>({ chainId })

  return useMemo(
    () =>
      data
        ? clientToSigner(data as Client<Transport, Chain, Account>)
        : undefined,
    [data]
  )
}
