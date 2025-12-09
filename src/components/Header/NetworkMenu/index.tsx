import { ReactElement } from 'react'
import Network from './Network'
import Details from './Details'
import Tooltip from '@shared/atoms/Tooltip'
import styles from './index.module.css'
import { useChainId } from 'wagmi'

export default function NetworkMenu(): ReactElement {
  const chainId = useChainId()

  return chainId ? (
    <div className={styles.networkMenu}>
      <Tooltip content={<Details />} trigger="click focus mouseenter">
        <Network />
      </Tooltip>
    </div>
  ) : null
}
