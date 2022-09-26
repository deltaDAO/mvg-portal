import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import { ReactComponent as Cross } from '../../images/cross.svg'
import Time from './Time'
import styles from './VerifiedBadge.module.css'
import Loader from './Loader'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  fillBackground,
  className,
  isInvalid,
  isLoading,
  apiVersion,
  timestamp
}: {
  text: string
  fillBackground?: boolean
  className?: string
  isInvalid?: boolean
  isLoading?: boolean
  apiVersion?: string
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    fillBackground,
    isInvalid,
    timestamp,
    [className]: className
  })

  const formattedApiVersion =
    apiVersion && apiVersion.slice(0, 2) + '.' + apiVersion.slice(2, 4)

  return (
    <div className={styles.container}>
      <div className={styleClasses}>
        {isLoading ? (
          <div className={styles.loader}>
            <Loader />
          </div>
        ) : isInvalid ? (
          <Cross />
        ) : (
          <VerifiedPatch />
        )}
        <span>{text}</span>
        {apiVersion && (
          <span className={styles.apiVersion}>
            version: {formattedApiVersion}
          </span>
        )}
        {timestamp && (
          <span className={styles.lastVerified}>
            last check: <Time date={new Date().toString()} relative />
          </span>
        )}
      </div>
    </div>
  )
}
