import React from 'react'
import styles from './index.module.css'

interface InfoProps {
  className?: string
}

// Component for Wallet Access Information
export const WalletAccessInfo: React.FC<InfoProps> = () => {
  return (
    <p className={styles.infoText}>
      <span className={styles.bold}>Web3 wallets</span> are used to{' '}
      <span className={styles.italic}>control access</span> to registered
      assets. Indicate <span className={styles.bold}>specific wallets</span> to{' '}
      <span className={styles.italic}>allow (or deny)</span> access to the
      asset, or <span className={styles.bold}>allow (or deny)</span> access to{' '}
      <span className={styles.italic}>all wallets</span> by clicking “
      <span className={styles.bold}>add all</span>”.
    </p>
  )
}

// Component for SSI Policy Information
export const SSIPolicyInfo: React.FC<InfoProps> = () => {
  return (
    <p className={styles.infoText}>
      <span className={styles.bold}>Self-sovereign identity (SSI)</span> is used
      to <span className={styles.italic}>verify the owner</span> of a specific{' '}
      <span className={styles.bold}>Web3 wallet</span>. Indicate which{' '}
      <span className={styles.bold}>SSI policy</span> is required for this asset
      (
      <span className={styles.italic}>
        static, parameterized, custom URL, other
      </span>
      ).
    </p>
  )
}
