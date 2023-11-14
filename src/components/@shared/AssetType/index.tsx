import { ReactElement } from 'react'
import styles from './index.module.css'
import Compute from '@images/compute.svg'
import Download from '@images/download.svg'
import Lock from '@images/lock.svg'
import Saas from '@images/saas.svg'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function AssetType({
  type,
  accessType,
  className
}: {
  type: string
  accessType: string
  className?: string
}): ReactElement {
  return (
    <div className={className || null}>
      {accessType === 'access' ? (
        <Download role="img" aria-label="Download" className={styles.icon} />
      ) : accessType === 'saas' ? (
        <Saas
          role="img"
          aria-label="Software as a Service"
          className={styles.icon}
        />
      ) : accessType === 'compute' && type === 'algorithm' ? (
        <Lock role="img" aria-label="Private" className={styles.icon} />
      ) : (
        <Compute role="img" aria-label="Compute" className={styles.icon} />
      )}
      <div className={styles.accessLabel}>
        {accessType === 'saas'
          ? null
          : accessType === 'access'
          ? 'download'
          : 'compute'}
      </div>
      <div
        className={cx({
          typeLabel: true,
          saasTypeLabel: accessType === 'saas'
        })}
      >
        {type === 'dataset'
          ? 'dataset'
          : type === 'saas'
          ? 'saas'
          : 'algorithm'}
      </div>
    </div>
  )
}
