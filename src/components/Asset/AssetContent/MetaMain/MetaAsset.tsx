import Publisher from '@shared/Publisher'
import { ReactElement } from 'react'
import styles from './MetaAsset.module.css'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function MetaAsset({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  return (
    <div className={styles.wrapper}>
      <span className={styles.owner}>
        Owned by <Publisher account={asset?.indexedMetadata?.nft?.owner} />
      </span>
    </div>
  )
}
