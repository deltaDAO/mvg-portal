import { ReactElement } from 'react'
import styles from './index.module.css'
import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'

export default function Title({
  asset,
  service
}: {
  asset: AssetExtended
  service: Service
}): ReactElement {
  return (
    <div className={styles.titleContainer}>
      <span className={styles.titleText}>Buy Dataset</span>
      <span className={`${styles.assetInfo} ${styles.right}`}>
        {asset.credentialSubject.metadata.name} - {service.name}
      </span>
    </div>
  )
}
