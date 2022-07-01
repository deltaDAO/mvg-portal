import React, { ReactElement } from 'react'
import Tooltip from './Tooltip'
import styles from './MenuDropdown.module.css'
import { ReactComponent as Caret } from '../../images/caret.svg'
import LinkOpener from '../molecules/LinkOpener'
import classNames from 'classnames/bind'
import MenuSubItems from './MenuSubItems'

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
}

export interface MenuNestedItem extends MenuItem {
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
  items: MenuNestedItem[]
}): ReactElement {
  return (
    <Tooltip
      content={
        <ul>
          {items.map((item, i) => (
            <li key={`${item.name}-${i}`}>
              {item?.subItems && item.subItems.length > 0 ? (
                <MenuSubItems label={item.name} subItems={item.subItems} />
              ) : (
                <LinkOpener uri={item.link} className={styles.link}>
                  {item.name}
                </LinkOpener>
              )}
            </li>
          ))}
        </ul>
      }
      placement="bottom"
      trigger="focus | click"
    >
      <ItemLabel name={label} />
    </Tooltip>
  )
}
