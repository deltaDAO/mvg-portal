import React, { ReactElement } from 'react'
import Tooltip from './Tooltip'
import styles from './MenuDropdown.module.css'
import { ReactComponent as Caret } from '../../images/caret.svg'
import LinkOpener from '../molecules/LinkOpener'
import classNames from 'classnames/bind'

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
                  <LinkOpener uri={link} className={styles.link}>
                    {name}
                  </LinkOpener>
                )}
              </li>
            )
          })}
        </ul>
      }
      placement="bottom"
      trigger="focus | click"
    >
      <ItemLabel name={label} />
    </Tooltip>
  )
}
