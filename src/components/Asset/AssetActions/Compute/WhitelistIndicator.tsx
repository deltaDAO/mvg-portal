import React from 'react'
import { accountTruncate } from '@utils/wallet'
import { Badge } from '@components/@shared/VerifiedBadge'
import classNames from 'classnames/bind'
import styles from './WhitelistIndicator.module.css'

const cx = classNames.bind(styles)

export default function WhitelistIndicator({
  accountId,
  isAccountIdWhitelisted,
  minimal
}: {
  accountId: string
  isAccountIdWhitelisted: boolean
  minimal?: boolean
}) {
  const styleClasses = cx({
    container: true,
    minimal
  })

  return (
    <div className={styleClasses}>
      <Badge
        isValid={isAccountIdWhitelisted}
        verifiedService={
          isAccountIdWhitelisted ? 'Access allowed' : 'Access denied'
        }
        className={styles.whitelistBadge}
      />
      {!isAccountIdWhitelisted && (
        <p className={styles.invalidAddressMessage}>
          {`The address ${accountTruncate(
            accountId
          )} is not allowed to access this asset. Please, connect with a different account and try again.`}
        </p>
      )}
    </div>
  )
}
