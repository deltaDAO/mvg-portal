import React, { ReactElement, useState, useEffect } from 'react'
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
import Web3 from 'web3'
import Button from '@shared/atoms/Button'
import RelatedAssets from '../RelatedAssets'
import {
  getFormattedCodeString,
  getServiceSD
} from '@components/Publish/_utils'
import SDVisualizer from '@components/@shared/SDVisualizer'

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
    isServiceSDVerified
  } = useAsset()
  const { debug } = useUserPreferences()
  const [receipts, setReceipts] = useState([])
  const [nftPublisher, setNftPublisher] = useState<string>()
  const [serviceSD, setServiceSD] = useState<string>()

  useEffect(() => {
    setNftPublisher(
      Web3.utils.toChecksumAddress(
        receipts?.find((e) => e.type === 'METADATA_CREATED')?.nft?.owner
      )
    )
  }, [receipts])

  useEffect(() => {
    if (!isServiceSDVerified) return
    const serviceSD =
      asset.metadata?.additionalInformation?.gaiaXInformation?.serviceSD
    if (serviceSD?.raw) {
      setServiceSD(JSON.parse(serviceSD?.raw))
    }
    if (serviceSD?.url) {
      getServiceSD(serviceSD?.url).then((serviceSelfDescription) =>
        setServiceSD(JSON.parse(serviceSelfDescription))
      )
    }
  }, [
    isServiceSDVerified,
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
                />
                {isServiceSDVerified && (
                  <div className={styles.sdVisualizer}>
                    <SDVisualizer
                      text={getFormattedCodeString(serviceSD) || ''}
                      title="Service Self-Description"
                      copyText={serviceSD && JSON.stringify(serviceSD, null, 2)}
                    />
                  </div>
                )}
                <MetaSecondary ddo={asset} />
              </>
            )}
            <MetaFull ddo={asset} />
            <EditHistory receipts={receipts} setReceipts={setReceipts} />
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
          <RelatedAssets />
        </div>
      </article>
    </>
  )
}
