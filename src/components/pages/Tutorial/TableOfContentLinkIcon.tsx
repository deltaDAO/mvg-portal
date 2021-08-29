import classNames from 'classnames/bind'
import React, { ReactElement, ReactNode } from 'react'
import Tooltip from '../../atoms/Tooltip'
import styles from './TableOfContentLinkIcon.module.css'
const cx = classNames.bind(styles)

export default function TableOfContentLinkicon({
  children,
  tooltip,
  before
}: {
  children: ReactNode
  tooltip: string
  before?: boolean
}): ReactElement {
  const styleClasses = cx({
    icon: true,
    before: before
  })

  return (
    <Tooltip
      placement="bottom"
      content={<span>{tooltip}</span>}
      className={styleClasses}
    >
      {children}
    </Tooltip>
  )
}
