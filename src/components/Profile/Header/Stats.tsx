import { ReactElement } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '@context/Profile'

export default function Stats(): ReactElement {
  const { assetsTotal, sales, downloadsTotal, revenue } = useProfile()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <NumberUnit label="Downloads" value={downloadsTotal} />
      <NumberUnit label="Revenue Ocean" value={revenue} />
    </div>
  )
}
