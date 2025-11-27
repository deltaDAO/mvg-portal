import { ReactElement, ReactNode } from 'react'
import { useSwitchChain } from 'wagmi'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
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
  const { switchChain } = useSwitchChain()

  return (
    <Button
      className={AddTokenStyles.button}
      style="text"
      size="small"
      onClick={() => switchChain({ chainId })}
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
