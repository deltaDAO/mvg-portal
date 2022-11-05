import React, { ReactElement } from 'react'
import { useWeb3 } from '../../providers/Web3'
import {
  addCustomNetwork,
  getNetworkDisplayName,
  getNetworkDataById
} from '../../utils/web3'
import Button from '../atoms/Button'
import styles from './WalletNetworkSwitcher.module.css'
import useNetworkMetadata from '../../hooks/useNetworkMetadata'

export default function WalletNetworkSwitcher({
  chainId
}: {
  chainId: number
}): ReactElement {
  const { web3Provider } = useWeb3()

  const { networksList } = useNetworkMetadata()
  const targetNetworkData = getNetworkDataById(networksList, chainId)

  const targetNetworkName = (
    <strong>{getNetworkDisplayName(targetNetworkData, chainId)}</strong>
  )

  async function switchWalletNetwork() {
    const networkNode = await networksList.find(
      (data) => data.node.chainId === chainId
    ).node
    addCustomNetwork(web3Provider, networkNode)
  }

  return (
    <>
      <p className={styles.text}>
        The portal does not support your currently selected network. Please
        connect to {targetNetworkName} to interact with this portal.
      </p>
      <Button
        style="primary"
        size="small"
        onClick={() => switchWalletNetwork()}
      >
        Switch to {targetNetworkName}
      </Button>
    </>
  )
}
