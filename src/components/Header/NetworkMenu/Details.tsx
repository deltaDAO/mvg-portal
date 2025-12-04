import { ReactElement } from 'react'
import { useAccount, useChains, useConnections } from 'wagmi'
import styles from './Details.module.css'
import AddTokenList from './AddTokenList'
import AddNetwork from '@components/@shared/AddNetwork'
import { getCustomChainIds } from 'chains.config.cjs'

export default function Details(): ReactElement {
  const connections = useConnections()
  const activeConnection = connections.find((c) => c.connector)
  const activeConnector = activeConnection?.connector

  const chains = useChains()
  const { chainId: activeChainId } = useAccount()

  const networksListToDisplay = chains.filter(
    (chain) => chain.id !== activeChainId
  )

  return (
    <div className={styles.details}>
      <ul>
        <li className={styles.networks}>
          <div title="Networks">Networks</div>
          {networksListToDisplay?.length > 0 &&
            networksListToDisplay.map((chain) => {
              if (!getCustomChainIds().includes(chain.id)) return false
              return (
                <AddNetwork
                  key={`add-network-button-${chain.id}`}
                  chainId={chain.id}
                  networkName={chain.name}
                />
              )
            })}
        </li>
        {activeConnector?.name === 'MetaMask' && (
          <li className={styles.tokens}>
            <div title="Tokens">Tokens</div>
            <AddTokenList />
          </li>
        )}
      </ul>
    </div>
  )
}
