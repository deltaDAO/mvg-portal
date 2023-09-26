import React, { ReactElement, ReactNode, useState } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import Caret from '@images/caret.svg'
import classNames from 'classnames/bind'
import Badge from '@shared/atoms/Badge'

const cx = classNames.bind(styles)

export default function Accordion({
  title,
  defaultState = false,
  badgeNumber,
  children
}: {
  title: string
  defaultState?: boolean
  badgeNumber?: number
  children: ReactNode
}): ReactElement {
  const [open, setOpen] = useState(!!defaultState)

  async function handleClick() {
    setOpen(!open)
  }

  return (
    <div className={cx({ actions: true, open })}>
      <h3 className={styles.title} onClick={handleClick}>
        <span>
          {title}
          {badgeNumber > 0 && (
            <Badge label={badgeNumber} className={styles.badge} />
          )}
        </span>
        <Button
          style="text"
          size="small"
          onClick={handleClick}
          className={styles.toggle}
        >
          <Caret />
        </Button>
      </h3>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
