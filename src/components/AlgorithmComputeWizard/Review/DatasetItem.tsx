import { ReactElement } from 'react'
import styles from './DatasetItem.module.css'

export default function DatasetItem({
  dataset
}: {
  dataset?: any
}): ReactElement {
  return (
    <div className={styles.datasetItem}>
      <div className={styles.datasetHeader}>
        <span className={styles.datasetName}>{dataset.name}</span>
      </div>
    </div>
  )
}
