import { ReactElement } from 'react'
import styles from './AddServiceCard.module.css'

export default function AddServiceCard({
  onClick
}: {
  onClick: () => void
}): ReactElement {
  return (
    <div onClick={onClick} className={styles.service}>
      <span className={styles.title}>Add a new service</span>
    </div>
  )
}
