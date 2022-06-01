import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import Time from './Time'
import styles from './VerifiedBadge.module.css'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  className,
  timestamp
}: {
  text: string
  className?: string
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    timestamp,
    [className]: className
  })

  return (
    <div className={styles.container}>
      <div className={styleClasses}>
        <VerifiedPatch />
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
