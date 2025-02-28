import { ReactElement, useEffect, useState } from 'react'
import Link from 'next/link'
import Dotdotdot from 'react-dotdotdot'
import Price from '@shared/Price'
import removeMarkdown from 'remove-markdown'
import Publisher from '@shared/Publisher'
import AssetType from '@shared/AssetType'
import NetworkName from '@shared/NetworkName'
import styles from './index.module.css'
import { getServiceByName } from '@utils/ddo'
import { useUserPreferences } from '@context/UserPreferences'
import { formatNumber } from '@utils/numbers'
import { AssetExtended } from 'src/@types/AssetExtended'
import {
  getAccessDetails,
  getOrderPriceAndFees
} from '@utils/accessDetailsAndPricing'

export declare type AssetTeaserProps = {
  asset: AssetExtended
  noPublisher?: boolean
  noDescription?: boolean
  noPrice?: boolean
}

export default function AssetTeaser({
  asset,
  noPublisher,
  noDescription
}: AssetTeaserProps): ReactElement {
  const { name, type, description } = asset.credentialSubject.metadata
  const { datatokens } = asset.credentialSubject
  const isCompute = Boolean(getServiceByName(asset, 'compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const owner = asset.credentialSubject.nft?.owner
  const { orders, allocated, price } = asset.credentialSubject.stats || {}
  const [accessDetails, setAccessDetails] = useState(null)
  const [orderPriceAndFees, setOrderPriceAndFees] = useState(null)
  const [isUnsupportedPricing, setIsUnsupportedPricing] = useState(false)

  const { locale } = useUserPreferences()

  useEffect(() => {
    async function fetchAccessDetails() {
      if (asset.credentialSubject?.services?.length > 0) {
        const details = await getAccessDetails(
          asset.credentialSubject?.chainId,
          asset.credentialSubject?.services[0]
        )
        setAccessDetails(details)
      }
    }

    fetchAccessDetails()
  }, [asset.credentialSubject?.chainId, asset.credentialSubject?.services])

  useEffect(() => {
    async function fetchOrderPriceAndFees() {
      if (asset.credentialSubject?.services?.length > 0) {
        const orderPrice = await getOrderPriceAndFees(
          asset,
          asset.credentialSubject?.services[0],
          accessDetails,
          owner
        )
        setOrderPriceAndFees(orderPrice)
      }
    }
    if (accessDetails) fetchOrderPriceAndFees()
  }, [
    asset.credentialSubject?.chainId,
    asset.credentialSubject?.services,
    accessDetails
  ])

  useEffect(() => {
    const unsupported =
      !asset.credentialSubject?.services.length ||
      (accessDetails && accessDetails.type === 'NOT_SUPPORTED')
    setIsUnsupportedPricing(unsupported)
  }, [asset.credentialSubject?.services, price?.value, accessDetails])

  return (
    <article className={`${styles.teaser} ${styles[type]}`}>
      <Link href={`/asset/${asset.id}`} className={styles.link}>
        <aside className={styles.detailLine}>
          <AssetType
            className={styles.typeLabel}
            type={type}
            accessType={accessType}
          />
          <span className={styles.typeLabel}>
            {datatokens[0]?.symbol.substring(0, 9)}
          </span>
        </aside>
        <header className={styles.header}>
          <Dotdotdot tagName="h1" clamp={3} className={styles.title}>
            {name.slice(0, 200)}
          </Dotdotdot>
          {!noPublisher && <Publisher account={owner} minimal />}
        </header>
        {!noDescription && (
          <div className={styles.content}>
            <Dotdotdot tagName="p" clamp={3}>
              {removeMarkdown(description?.['@value']?.substring(0, 300) || '')}
            </Dotdotdot>
          </div>
        )}
        <div className={styles.price}>
          {accessDetails &&
            (isUnsupportedPricing ? (
              <strong>No pricing schema available</strong>
            ) : (
              <Price
                price={price || { value: parseFloat(accessDetails.price) }}
                orderPriceAndFees={orderPriceAndFees}
                size="small"
              />
            ))}
        </div>
        <footer className={styles.footer}>
          <div className={styles.stats}>
            {allocated && allocated > 0 ? (
              <span className={styles.typeLabel}>
                {allocated < 0 ? (
                  ''
                ) : (
                  <>
                    <strong>{formatNumber(allocated, locale, '0')}</strong>{' '}
                    veOCEAN
                  </>
                )}
              </span>
            ) : null}
            {orders && orders > 0 ? (
              <span className={styles.typeLabel}>
                {orders < 0 ? (
                  'N/A'
                ) : (
                  <>
                    <strong>{orders}</strong> {orders === 1 ? 'sale' : 'sales'}
                  </>
                )}
              </span>
            ) : null}
            {asset.views && asset.views > 0 ? (
              <span className={styles.typeLabel}>
                {asset.views < 0 ? (
                  'N/A'
                ) : (
                  <>
                    <strong>{asset.views}</strong>{' '}
                    {asset.views === 1 ? 'view' : 'views'}
                  </>
                )}
              </span>
            ) : null}
          </div>
          <NetworkName
            networkId={asset.credentialSubject?.chainId}
            className={styles.networkName}
          />
        </footer>
      </Link>
    </article>
  )
}
