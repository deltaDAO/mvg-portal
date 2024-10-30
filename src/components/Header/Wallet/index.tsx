import { ReactElement } from 'react'
import Account from './Account'
import Details from './Details'
import Tooltip from '@shared/atoms/Tooltip'
import styles from './index.module.css'
import { useAccount } from 'wagmi'

export default function Wallet(): ReactElement {
  const { address: accountId } = useAccount()

  return (
    <div className={styles.wallet}>
      <Tooltip
        content={<Details />}
        trigger="click focus mouseenter"
        disabled={!accountId}
      >
        <Account />
      </Tooltip>
    </div>
  )
}
