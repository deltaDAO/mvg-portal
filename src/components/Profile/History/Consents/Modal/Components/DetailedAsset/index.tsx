import Publisher from '@components/@shared/Publisher'
import IconAlgorithm from '@images/algorithm.svg'
import IconDataset from '@images/dataset.svg'
import { Asset } from '@oceanprotocol/lib'
import { PropsWithChildren, ReactNode } from 'react'
import AssetLink from '../AssetLink'
import { Icon } from '../Icon'
import styles from './index.module.css'

function DetailedAsset({ children }: PropsWithChildren) {
  return <div className={styles.content}>{children}</div>
}

function AssetInfo({
  children,
  asset
}: {
  children?: ReactNode
  asset: Asset
}) {
  return (
    <div className={styles.assetInfoContainer}>
      <Icon>
        {asset?.metadata?.algorithm ? (
          <IconAlgorithm />
        ) : (
          <IconDataset styles={{ fill: 'red' }} />
        )}
      </Icon>
      <div>
        {children && <span className={styles.title}>{children}</span>}
        <AssetLink asset={asset} className={styles.assetName} />
        <span className={styles.publisher}>
          by <Publisher account={asset.nft.owner} showName />
        </span>
      </div>
    </div>
  )
}

DetailedAsset.AssetInfo = AssetInfo

export default DetailedAsset
