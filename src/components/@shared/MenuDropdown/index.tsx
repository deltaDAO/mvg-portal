import { ReactElement } from 'react'
import styles from './index.module.css'
import Caret from '@images/caret.svg'
import classNames from 'classnames/bind'
import { MenuLink } from '@components/Header/Menu'
import Tooltip from '../atoms/Tooltip'
import { useRouter } from 'next/router'

const cx = classNames.bind(styles)

declare type MenuItem = {
  name: string
  link?: string
  subItems?: MenuItem[]
}

export function ItemLabel({
  name,
  className,
  isActive
}: {
  name: string
  className?: string
  isActive?: boolean
}): ReactElement {
  return (
    <div
      className={cx({
        menuItem: true,
        active: isActive,
        [className]: className
      })}
    >
      {name}
      <Caret aria-hidden="true" className={styles.caret} />
    </div>
  )
}

// Helper function to check if any sub-item is active
function hasActiveSubItem(items: MenuItem[], currentPath: string): boolean {
  return items.some((item) => {
    if (item.link && currentPath === item.link) {
      return true
    }
    if (item.subItems && item.subItems.length > 0) {
      return hasActiveSubItem(item.subItems, currentPath)
    }
    return false
  })
}

export default function MenuDropdown({
  label,
  items
}: {
  label: string
  items: MenuItem[]
}): ReactElement {
  const router = useRouter()
  const currentPath = router?.pathname
  const isActive = hasActiveSubItem(items, currentPath)

  return (
    <Tooltip
      content={
        <ul>
          {items.map((item, i) => {
            const { name, subItems } = item
            return (
              <li key={`${name}-${i}`}>
                {subItems && subItems.length > 0 ? (
                  <MenuDropdown label={name} items={subItems} />
                ) : (
                  <MenuLink {...item} className={styles.subItem} />
                )}
              </li>
            )
          })}
        </ul>
      }
      placement="bottom"
      trigger="click focus mouseenter"
    >
      <ItemLabel name={label} isActive={isActive} />
    </Tooltip>
  )
}
