import { ReactElement } from 'react'
import styles from './index.module.css'

interface AnchorItem {
  label: string
  anchor: string
}

interface AnchorNavigationProps {
  items: AnchorItem[]
}

export default function AnchorNavigation({
  items
}: AnchorNavigationProps): ReactElement {
  const handleClick = (item: AnchorItem) => {
    const element = document.getElementById(item.anchor)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className={styles.container}>
      {items.map((item) => (
        <button
          key={item.anchor}
          className={styles.button}
          onClick={() => handleClick(item)}
          type="button"
        >
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}
