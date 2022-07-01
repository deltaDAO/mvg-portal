import React, { ReactElement } from 'react'
import LinkOpener from '../molecules/LinkOpener'
import { ItemLabel, MenuNestedItem } from './MenuDropdown'
import Tooltip from './Tooltip'
import styles from './MenuSubItems.module.css'

export default function MenuSubItems({
  label,
  subItems
}: {
  label: string
  subItems: MenuNestedItem[]
}): ReactElement {
  return (
    <Tooltip
      content={
        <ul>
          {subItems &&
            subItems.length > 0 &&
            subItems.map((subItem, i) => (
              <li key={`${subItem.name}-${i}`}>
                <LinkOpener uri={subItem.link} className={styles.link}>
                  {subItem.name}
                </LinkOpener>
              </li>
            ))}
        </ul>
      }
      placement="auto-end"
      trigger="focus | click"
    >
      <ItemLabel name={label} className="subItem" />
    </Tooltip>
  )
}
