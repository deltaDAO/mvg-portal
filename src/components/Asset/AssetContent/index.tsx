import { ReactElement, useState, useEffect } from 'react'
import Markdown from '@shared/Markdown'
import MetaFull from './MetaFull'
import MetaSecondary from './MetaSecondary'
import AssetActions from '../AssetActions'
import { useUserPreferences } from '@context/UserPreferences'
import Bookmark from './Bookmark'
import { useAsset } from '@context/Asset'
import Alert from '@shared/atoms/Alert'
import DebugOutput from '@shared/DebugOutput'
import MetaMain from './MetaMain'
import EditHistory from './EditHistory'
import styles from './index.module.css'
import NetworkName from '@shared/NetworkName'
import content from '../../../../content/purgatory.json'
import Button from '@shared/atoms/Button'
import RelatedAssets from '../RelatedAssets'
import {
  getFormattedCodeString,
  getServiceCredential
} from '@components/Publish/_utils'
import ServiceCredentialVisualizer from '@components/@shared/ServiceCredentialVisualizer'
import Web3Feedback from '@components/@shared/Web3Feedback'
import { useAccount } from 'wagmi'
import DDODownloadButton from '@components/@shared/DDODownloadButton'

export default function AssetContent({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const {
    isInPurgatory,
    purgatoryData,
    isOwner,
    isAssetNetwork,
    isServiceCredentialVerified
  } = useAsset()
  const { address: accountId } = useAccount()
  const { allowExternalContent, debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  const [nftPublisher, setNftPublisher] = useState<string>()
  const [serviceCredential, setServiceCredential] = useState<string>()

  useEffect(() => {
    if (!receipts.length) return

    const publisher = receipts?.find((e) => e.type === 'METADATA_CREATED')?.nft
      ?.owner
    setNftPublisher(publisher)
  }, [receipts])

  useEffect(() => {
    if (!isServiceCredentialVerified) return
    const serviceCredential =
      asset.metadata?.additionalInformation?.gaiaXInformation?.serviceSD
    if (serviceCredential?.raw) {
      setServiceCredential(JSON.parse(serviceCredential?.raw))
    }
    if (serviceCredential?.url) {
      getServiceCredential(serviceCredential?.url).then((credential) =>
        setServiceCredential(JSON.parse(credential))
      )
    }
  }, [
    isServiceCredentialVerified,
    asset.metadata?.additionalInformation?.gaiaXInformation?.serviceSD
  ])

  return (
    <>
      <div className={styles.networkWrap}>
        <NetworkName networkId={asset?.chainId} className={styles.network} />
      </div>

      <article className={styles.grid}>
        <div>
          <div className={styles.content}>
            <MetaMain asset={asset} nftPublisher={nftPublisher} />
            {asset?.accessDetails?.datatoken !== null && (
              <Bookmark did={asset?.id} />
            )}
            {isInPurgatory === true ? (
              <Alert
                title={content.asset.title}
                badge={`Reason: ${purgatoryData?.reason}`}
                text={content.asset.description}
                state="error"
              />
            ) : (
              <>
                <Markdown
                  className={styles.description}
                  text={asset?.metadata?.description || ''}
                  blockImages={!allowExternalContent}
                />
                {isServiceCredentialVerified && (
                  <ServiceCredentialVisualizer
                    text={getFormattedCodeString(serviceCredential) || ''}
                    title="Service Credential"
                    copyText={
                      serviceCredential &&
                      JSON.stringify(serviceCredential, null, 2)
                    }
                    collapsible
                  />
                )}
                <MetaSecondary ddo={asset} />
              </>
            )}
            <MetaFull ddo={asset} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap'
              }}
            >
              <EditHistory receipts={receipts} setReceipts={setReceipts} />
              <DDODownloadButton asset={asset} />
            </div>
            {debug === true && <DebugOutput title="DDO" output={asset} />}
          </div>
        </div>

        <div className={styles.actions}>
          <AssetActions asset={asset} />
          {isOwner && isAssetNetwork && (
            <div className={styles.ownerActions}>
              <Button style="text" size="small" to={`/asset/${asset?.id}/edit`}>
                Edit Asset
              </Button>
            </div>
          )}
          <Web3Feedback
            networkId={asset?.chainId}
            accountId={accountId}
            isAssetNetwork={isAssetNetwork}
          />
          <RelatedAssets />
        </div>
      </article>
    </>
  )
}
