import QueryBoundary from '@components/@shared/QueryBoundary'
import { useProfile } from '@context/Profile'
import { ReactElement } from 'react'
import NumberUnit from './NumberUnit'
import styles from './Stats.module.css'
import StatsConsents from './StatsConsents'

export default function Stats(): ReactElement {
  const { assetsTotal, sales } = useProfile()

  return (
    <div className={styles.stats}>
      <NumberUnit
        label={`Sale${sales === 1 ? '' : 's'}`}
        value={typeof sales !== 'number' || sales < 0 ? 0 : sales}
      />
      <NumberUnit label="Published" value={assetsTotal} />
      <QueryBoundary text="Loading consents stats">
        <StatsConsents />
      </QueryBoundary>
    </div>
  )
}
