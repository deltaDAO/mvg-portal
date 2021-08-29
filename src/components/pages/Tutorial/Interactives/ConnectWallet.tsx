import React from 'react'
import { ReactElement } from 'react-markdown'
import PageHeader from '../../../molecules/PageHeader'
import Wallet from '../../../molecules/Wallet'
import styles from './ConnectWallet.module.css'

export default function ConnectWallet(): ReactElement {
  return (
    <div className={styles.wrapper}>
      <PageHeader title="Connect your wallet below" center />
      <Wallet />
    </div>
  )
}
