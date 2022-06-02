import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import { ReactComponent as Cross } from '../../images/cross.svg'
import Time from './Time'
import styles from './VerifiedBadge.module.css'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  className,
  isInvalid,
  timestamp
}: {
  text: string
  className?: string
  isInvalid?: boolean
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    isInvalid,
    timestamp,
    [className]: className
  })

  return (
    <div className={styles.container}>
      <div className={styleClasses}>
        {isInvalid ? <Cross /> : <VerifiedPatch />}
        <span>{text}</span>
        {timestamp && (
          <span className={styles.lastVerified}>
            last check: <Time date={new Date().toString()} relative />
          </span>
        )}
      </div>
    </div>
  )
}
