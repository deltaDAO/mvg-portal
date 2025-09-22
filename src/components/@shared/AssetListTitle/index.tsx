import Link from 'next/link'
import { ReactElement, useEffect, useState } from 'react'
import styles from './index.module.css'
import axios from 'axios'
import { useMarketMetadata } from '@context/MarketMetadata'
import { Asset } from 'src/@types/Asset'

export default function AssetListTitle({
  asset,
  did,
  title
}: {
  asset?: Asset
  did?: string
  title?: string
}): ReactElement {
  const { appConfig } = useMarketMetadata()
  const [assetTitle, setAssetTitle] = useState<string>(title)
  const [assetTitleTrimmed, setAssetTitleTrimmed] = useState(title)
  useEffect(() => {
    if (title || !appConfig.metadataCacheUri) return
    if (asset) {
      const name = asset.credentialSubject?.metadata.name
      setAssetTitle(name)

      if (name.length > 16) {
        setAssetTitleTrimmed(name.slice(0, 13) + '...')
        return
      }
      setAssetTitleTrimmed(name)
      return
    }

    const source = axios.CancelToken.source()

    async function getAssetName() {
      if (title.length > 16) {
        setAssetTitleTrimmed(title.slice(0, 13) + '...')
      } else {
        setAssetTitleTrimmed(title)
      }
    }
    !asset && did && getAssetName()

    return () => {
      source.cancel()
    }
  }, [assetTitle, appConfig.metadataCacheUri, asset, did, title])

  return (
    <span className={styles.title}>
      <Link href={`/asset/${did || asset?.id}`}>
        <span className={styles.titleWrapper} title={assetTitle}>
          {assetTitleTrimmed}
        </span>
      </Link>
    </span>
  )
}
