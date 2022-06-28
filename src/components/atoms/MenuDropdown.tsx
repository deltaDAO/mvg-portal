import React, { ReactElement } from 'react'
import Tooltip from './Tooltip'
import styles from './MenuDropdown.module.css'
import { ReactComponent as Caret } from '../../images/caret.svg'
import { MenuItem } from '../molecules/Menu'
import LinkOpener from '../molecules/LinkOpener'

interface MenuNestedItem extends Partial<MenuItem> {
  subLinks?: MenuItem[]
}

export default function MenuDropdown({
  label,
  links
}: {
  label: string
  links: MenuNestedItem[]
}): ReactElement {
  return (
    <Tooltip
      content={
        <ul>
          {links.map((e) => (
            <li key={e.name}>
              <LinkOpener uri={e.link} openNewTab className={styles.link}>
                {e.name}
              </LinkOpener>
              {/* <Link
                  to={`/topic/${e.id}`}
                  className={
                    location?.pathname === `/topic/${e.id}`
                      ? `${styles.link} ${styles.active}`
                      : styles.link
                  }
                >
                  {`${e.order}. ${e.short}`}
                </Link> */}
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
