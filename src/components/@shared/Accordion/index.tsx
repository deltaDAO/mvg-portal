import React, { ReactElement, ReactNode, useState } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import Caret from '@images/caret.svg'
import classNames from 'classnames/bind'
import Badge from '@shared/atoms/Badge'

const cx = classNames.bind(styles)

export default function Accordion({
  title,
  defaultExpanded = false,
  badgeNumber,
  compact,
  action,
  children
}: {
  title: string
  defaultExpanded?: boolean
  badgeNumber?: number
  compact?: boolean
  action?: ReactNode
  children: ReactNode
}): ReactElement {
  const [open, setOpen] = useState(!!defaultExpanded)

  async function handleClick() {
    setOpen(!open)
  }

  return (
    <div className={cx({ actions: true, open })}>
      <h3
        className={compact ? styles.compactTitle : styles.title}
        onClick={handleClick}
      >
        <span>{title}</span>
        {badgeNumber > 0 && (
          <Badge label={badgeNumber} className={styles.badge} />
        )}
        <Button
          style="text"
          size="small"
          onClick={handleClick}
          className={styles.toggle}
        >
          <Caret />
        </Button>
      </h3>
      {action}
      <div className={cx({ content: true, compactContent: compact })}>
        {children}
      </div>
    </div>
  )
}
