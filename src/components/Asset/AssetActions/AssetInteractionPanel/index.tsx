import { ReactElement } from 'react'
import styles from './index.module.css'
import FileSVG from '@images/file.svg'
import { AssetActionCheckCredentials } from '../CheckCredentials'
import { FileInfo } from '@oceanprotocol/lib'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { useSsiWallet } from '@context/SsiWallet'
import appConfig from 'app.config.cjs'
import Compute from '../Compute'
import Download from '../Download'
import { requiresSsi } from '@utils/credentials'

interface AssetInteractionPanelProps {
  asset: AssetExtended
  service: Service
  accessDetails: AccessDetails
  serviceIndex: number
  file: FileInfo
  fileIsLoading: boolean
  isAccountIdWhitelisted: boolean
  accountId: string
  signer: any
  dtBalance: string
  isBalanceSufficient: boolean
  isCompute: boolean
  consumableFeedback?: string
}

export default function AssetInteractionPanel({
  asset,
  service,
  accessDetails,
  serviceIndex,
  file,
  fileIsLoading,
  isAccountIdWhitelisted,
  accountId,
  signer,
  dtBalance,
  isBalanceSufficient,
  isCompute,
  consumableFeedback
}: AssetInteractionPanelProps): ReactElement {
  const { verifierSessionCache, lookupVerifierSessionId } = useSsiWallet()

  const hasVerifiedCredentials =
    verifierSessionCache && lookupVerifierSessionId(asset.id, service.id)

  const ssiRequired =
    requiresSsi(asset?.credentialSubject?.credentials) ||
    requiresSsi(service?.credentials)

  const priceDisplay =
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
          <div className={styles.priceValue}>{priceDisplay}</div>
          <div className={styles.salesCount}>
            {salesCount} sale{salesCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className={styles.actionButtonWrapper}>
        {appConfig.ssiEnabled ? (
          <>
            {ssiRequired === false || hasVerifiedCredentials ? (
              isCompute ? (
                <Compute
                  accountId={accountId}
                  signer={signer}
                  asset={asset}
                  service={service}
                  accessDetails={accessDetails}
                  dtBalance={dtBalance}
                  isAccountIdWhitelisted={isAccountIdWhitelisted}
                  file={file}
                  fileIsLoading={fileIsLoading}
                  consumableFeedback={consumableFeedback}
                />
              ) : (
                <Download
                  accountId={accountId}
                  signer={signer}
                  asset={asset}
                  service={service}
                  accessDetails={accessDetails}
                  serviceIndex={serviceIndex}
                  dtBalance={dtBalance}
                  isBalanceSufficient={isBalanceSufficient}
                  isAccountIdWhitelisted={isAccountIdWhitelisted}
                  file={file}
                  fileIsLoading={fileIsLoading}
                />
              )
            ) : (
              <AssetActionCheckCredentials asset={asset} service={service} />
            )}
          </>
        ) : isCompute ? (
          <Compute
            accountId={accountId}
            signer={signer}
            asset={asset}
            service={service}
            accessDetails={accessDetails}
            dtBalance={dtBalance}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            file={file}
            fileIsLoading={fileIsLoading}
            consumableFeedback={consumableFeedback}
          />
        ) : (
          <Download
            accountId={accountId}
            signer={signer}
            asset={asset}
            service={service}
            accessDetails={accessDetails}
            serviceIndex={serviceIndex}
            dtBalance={dtBalance}
            isBalanceSufficient={isBalanceSufficient}
            isAccountIdWhitelisted={isAccountIdWhitelisted}
            file={file}
            fileIsLoading={fileIsLoading}
          />
        )}
      </div>
    </div>
  )
}
