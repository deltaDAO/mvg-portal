import React from 'react'
import VerifiedBadge from '@components/@shared/VerifiedBadge'
import styles from './WhitelistIndicator.module.css'

export default function WhitelistIndicator({
  accountId,
  isAccountIdWhitelisted
}: {
  accountId: string
  isAccountIdWhitelisted: boolean
}) {
  return (
    <div className={styles.container}>
      <VerifiedBadge
        isInvalid={!isAccountIdWhitelisted}
        text={isAccountIdWhitelisted ? 'Access allowed' : 'Access denied'}
        className={styles.whitelistBadge}
      />
      {!isAccountIdWhitelisted && (
        <p className={styles.invalidAddressMessage}>
          {`The address ${accountId} is not allowed to access this asset. Please, connect with a different account and try again.`}
        </p>
      )}
    </div>
  )
}
