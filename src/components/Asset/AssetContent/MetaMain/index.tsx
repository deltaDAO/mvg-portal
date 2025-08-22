import { ReactElement } from 'react'
import styles from './index.module.css'
import MetaAsset from './MetaAsset'
import MetaInfo from './MetaInfo'
import Nft from '../Nft'
import VerifiedBadge from '@components/@shared/VerifiedBadge'
import { useAsset } from '@context/Asset'

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
    isIdMatchVerifiable,
    serviceCredentialVersion,
    isVerifyingServiceCredential,
    verifiedServiceProviderName
  } = useAsset()

  return (
    <aside className={styles.meta}>
      <header className={styles.asset}>
        <Nft />
        <MetaAsset asset={asset} />
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
              isIdMatchVerifiable={isIdMatchVerifiable}
              apiVersion={serviceCredentialVersion}
              timestamp={isServiceCredentialVerified}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
