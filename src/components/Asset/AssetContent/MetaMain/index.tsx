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
    isServiceCredentialVerified,
    serviceCredentialIdMatch,
    serviceCredentialVersion,
    isVerifyingServiceCredential,
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
            isServiceCredentialVerified && verifiedServiceProviderName
          }
        />
        {(isVerifyingServiceCredential || isServiceCredentialVerified) && (
          <div className={styles.badgeContainer}>
            <VerifiedBadge
              isLoading={isVerifyingServiceCredential}
              isValid={isServiceCredentialVerified}
              idMatch={serviceCredentialIdMatch}
              apiVersion={serviceCredentialVersion}
              timestamp={isServiceCredentialVerified}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
