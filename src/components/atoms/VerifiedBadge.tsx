import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatch } from '../../images/patch_check.svg'
import styles from './VerifiedBadge.module.css'

const cx = classNames.bind(styles)

export default function VerifiedBadge({
  text,
  className,
  noBackground
}: {
  text: string
  className?: string
  noBackground?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    noBackground,
    [className]: className
  })

  return (
    <div className={styleClasses}>
      <VerifiedPatch /> <span>{text}</span>
    </div>
  )
}
