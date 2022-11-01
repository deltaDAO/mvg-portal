import React, { ReactElement } from 'react'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import { Link } from 'gatsby'
import { accountTruncate } from '../../../utils/web3'

const cx = classNames.bind(styles)

export default function Publisher({
  account,
  minimal,
  verifiedServiceProviderName,
  className
}: {
  account: string
  minimal?: boolean
  verifiedServiceProviderName?: string
  className?: string
}): ReactElement {
  const name = verifiedServiceProviderName || accountTruncate(account)

  const styleClasses = cx({
    publisher: true,
    [className]: className
  })

  return (
    <div className={styleClasses}>
      {minimal ? (
        name
      ) : (
        <Link to={`/profile/${account}`} title="Show profile page.">
          {name}
        </Link>
      )}
    </div>
  )
}
