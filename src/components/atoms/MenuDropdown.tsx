import React, { ReactElement } from 'react'
import Tooltip from './Tooltip'
import styles from './MenuDropdown.module.css'
import { ReactComponent as Caret } from '../../images/caret.svg'
import classNames from 'classnames/bind'
import { MenuLink } from '../molecules/Menu'

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
  subItems?: MenuItem[]
}

export function ItemLabel({
  name,
  className
}: {
  name: string
  className?: string
}): ReactElement {
  return (
    <div className={cx({ menuItem: true, [className]: className })}>
      {name}
      <Caret aria-hidden="true" className={styles.caret} />
    </div>
  )
}

export default function MenuDropdown({
  label,
  items
}: {
  label: string
  items: MenuItem[]
}): ReactElement {
  return (
    <Tooltip
      content={
        <ul>
          {items.map((item, i) => {
            const { name, link, subItems } = item
            return (
              <li key={`${name}-${i}`}>
                {subItems && subItems.length > 0 ? (
                  <MenuDropdown label={name} items={subItems} />
                ) : (
                  <MenuLink name={name} link={link} />
                )}
              </li>
            )
          })}
        </ul>
      }
      placement="bottom"
      trigger="click focus mouseenter"
    >
      <ItemLabel name={label} />
    </Tooltip>
  )
}
