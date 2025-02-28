import AssetType from '@shared/AssetType'
import Time from '@shared/atoms/Time'
import Publisher from '@shared/Publisher'
import { getServiceByName } from '@utils/ddo'
import { ReactElement } from 'react'
import styles from './MetaInfo.module.css'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function MetaInfo({
  asset,
  nftPublisher,
  verifiedServiceProviderName
}: {
  asset: AssetExtended
  nftPublisher: string
  verifiedServiceProviderName?: string
}): ReactElement {
  const isCompute = Boolean(getServiceByName(asset, 'compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const nftOwner = asset?.credentialSubject?.nft?.owner

  return (
    <div className={styles.wrapper}>
      <AssetType
        type={asset?.credentialSubject?.metadata.type}
        accessType={accessType}
        className={styles.assetType}
      />
      <div className={styles.byline}>
        <div>
          Published{' '}
          <Time date={asset?.credentialSubject?.metadata.created} relative />
          {(verifiedServiceProviderName ||
            (nftPublisher && nftPublisher !== nftOwner)) && (
            <span>
              {' by '}{' '}
              <Publisher
                account={nftPublisher}
                verifiedServiceProviderName={verifiedServiceProviderName}
              />
            </span>
          )}
          {asset?.credentialSubject?.metadata.created !==
            asset?.credentialSubject?.metadata.updated && (
            <>
              {' — '}
              <span className={styles.updated}>
                updated{' '}
                <Time
                  date={asset?.credentialSubject?.metadata.updated}
                  relative
                />
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
