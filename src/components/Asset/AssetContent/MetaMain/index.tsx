import React, { ReactElement } from 'react'
import styles from './index.module.css'
import MetaAsset from './MetaAsset'
import MetaInfo from './MetaInfo'
import Nft from '../Nft'
import VerifiedBadge from '@components/@shared/VerifiedBadge'
import { useAsset } from '@context/Asset'

const blockscoutNetworks = [1287, 2021000, 2021001, 44787, 246, 1285]

export default function MetaMain({
  asset,
  nftPublisher
}: {
  asset: AssetExtended
  nftPublisher: string
}): ReactElement {
  const {
    isServiceSDVerified,
    serviceSDVersion,
    isVerifyingSD,
    verifiedServiceProviderName
  } = useAsset()
  const isBlockscoutExplorer = blockscoutNetworks.includes(asset?.chainId)

  return (
    <aside className={styles.meta}>
      <header className={styles.asset}>
        <Nft isBlockscoutExplorer={isBlockscoutExplorer} />
        <MetaAsset asset={asset} isBlockscoutExplorer={isBlockscoutExplorer} />
      </header>
      <div className={styles.publisherInfo}>
        <MetaInfo
          asset={asset}
          nftPublisher={nftPublisher}
          verifiedServiceProviderName={
            isServiceSDVerified && verifiedServiceProviderName
          }
        />
        {(isVerifyingSD || isServiceSDVerified) && (
          <div className={styles.badgeContainer}>
            <VerifiedBadge
              text="Service Self-Description"
              isLoading={isVerifyingSD}
              apiVersion={serviceSDVersion}
              timestamp={isServiceSDVerified}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
