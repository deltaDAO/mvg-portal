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
}

interface MenuNestedItem extends MenuItem {
  subItems?: MenuItem[]
}

function ItemLabel({
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
                <Tooltip
                  content={
                    <ul>
                      {item.subItems.map((subItem, i) => (
                        <li key={`${subItem.name}-${i}`}>
                          <LinkOpener
                            uri={subItem.link}
                            openNewTab
                            className={styles.link}
                          >
                            {subItem.name}
                          </LinkOpener>
                        </li>
                      ))}
                    </ul>
                  }
                  placement="right-start"
                  trigger="focus | click"
                >
                  <ItemLabel name={item.name} className="subItem" />
                </Tooltip>
              ) : (
                <LinkOpener uri={item.link} openNewTab className={styles.link}>
                  {item.name}
                </LinkOpener>
              )}
            </li>
          ))}
        </ul>
      }
      trigger="focus | click"
    >
      <ItemLabel name={label} />
    </Tooltip>
  )
}
