import React, { ReactElement } from 'react'
import Tooltip from './Tooltip'
import styles from './MenuDropdown.module.css'
import { ReactComponent as Caret } from '../../images/caret.svg'
import { MenuItem } from '../molecules/Menu'
import LinkOpener from '../molecules/LinkOpener'

interface MenuNestedItem extends Partial<MenuItem> {
  subItems?: MenuItem[]
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
                  trigger="mouseenter | focus | click"
                >
                  <div className={styles.menuLink}>
                    {item.name}
                    <Caret aria-hidden="true" className={styles.caret} />
                  </div>
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
      trigger="mouseenter | focus | click"
    >
      <div className={styles.menuLink}>
        {label}
        <Caret aria-hidden="true" className={styles.caret} />
      </div>
    </Tooltip>
  )
}
