import React, { ReactElement, ReactNode } from 'react'
import { useWeb3 } from '@context/Web3'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { switchWalletNetwork } from '../WalletNetworkSwitcher'
import EthIcon from '@images/eth.svg'
import AddTokenStyles from '../AddToken/index.module.css'

export interface AddNetworkProps {
  chainId: number
  networkName: string
  logo?: ReactNode
}

export default function AddNetwork({
  chainId,
  networkName,
  logo
}: AddNetworkProps): ReactElement {
  const { web3Provider } = useWeb3()
  const { networksList } = useNetworkMetadata()

  async function handleAddToken() {
    if (!web3Provider || !networksList || !chainId) return

    await switchWalletNetwork(web3Provider, networksList, chainId)
  }

  return (
    <Button
      className={AddTokenStyles.button}
      style="text"
      size="small"
      onClick={handleAddToken}
    >
      <span className={AddTokenStyles.logoWrap}>
        <div className={styles.logo}>{logo || <EthIcon />}</div>
      </span>

      <span className={AddTokenStyles.text}>
        {'Add '}
        <span className={AddTokenStyles.symbol}>{networkName}</span>
      </span>
    </Button>
  )
}
