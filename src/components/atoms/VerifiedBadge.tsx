import classNames from 'classnames/bind'
import moment from 'moment'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import Time from './Time'
import styles from './VerifiedBadge.module.css'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  className,
  noBackground,
  timestamp
}: {
  text: string
  className?: string
  noBackground?: boolean
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    noBackground,
    [className]: className
  })

  return (
    <div className={styles.container}>
      <div className={styleClasses}>
        <VerifiedPatch /> <span>{text}</span>
      </div>
      {timestamp && (
        <span>
          Verified: <Time date={new Date().toString()} relative />
        </span>
      )}
    </div>
  )
}
