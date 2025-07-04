import { ReactElement } from 'react'
import styles from './index.module.css'
import FileSVG from '@images/file.svg'
import { AssetActionCheckCredentials } from '../CheckCredentials'
import { FileInfo } from '@oceanprotocol/lib'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'

interface AssetInteractionPanelProps {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  serviceIndex: number
  file: FileInfo
  fileIsLoading: boolean
  isAccountIdWhitelisted: boolean
}

export default function AssetInteractionPanel({
  asset,
  service,
  accessDetails,
  serviceIndex,
  file,
  fileIsLoading,
  isAccountIdWhitelisted
}: AssetInteractionPanelProps): ReactElement {
  const price =
    accessDetails.type === 'free'
      ? 'Free'
      : `${accessDetails.price || 0} ${accessDetails.baseToken?.symbol || ''}`
  const salesCount = asset.indexedMetadata?.stats?.[0]?.orders || 0

  return (
    <div className={styles.assetInteractionCard}>
      <div className={styles.cardTopRow}>
        <div className={styles.fileInfoSection}>
          <FileSVG width={48} height={60} />
          <div className={styles.fileDetails}>
            <div className={styles.fileDetailItem}>
              <span className={styles.fileDetailLabel}>Type:</span>{' '}
              {file?.type || 'Plain Text'}
            </div>
            <div className={styles.fileDetailItem}>
              <span className={styles.fileDetailLabel}>Size:</span>{' '}
              {file?.contentLength || '5.31 kB'}
            </div>
            <div className={styles.fileDetailItem}>
              <span className={styles.fileDetailLabel}>Access via:</span>{' '}
              {accessDetails.type === 'free' ? 'URL' : accessDetails.type}
            </div>
          </div>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceValue}>{price}</div>
          <div className={styles.salesCount}>
            {salesCount} sale{salesCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className={styles.actionButtonWrapper}>
        <AssetActionCheckCredentials asset={asset} service={service} />
      </div>
    </div>
  )
}
