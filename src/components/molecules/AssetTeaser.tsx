import React from 'react'
import Dotdotdot from 'react-dotdotdot'
import Price from '../atoms/Price'
import { DDO, BestPrice } from '@oceanprotocol/lib'
import removeMarkdown from 'remove-markdown'
import Publisher from '../atoms/Publisher'
import AssetType from '../atoms/AssetType'
import NetworkName from '../atoms/NetworkName'
import styles from './AssetTeaser.module.css'
import LinkOpener from '../molecules/LinkOpener'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import { ReactComponent as External } from '../../images/external.svg'

declare type AssetTeaserProps = {
  ddo: DDO
  price: BestPrice
}

const AssetTeaser: React.FC<AssetTeaserProps> = ({
  ddo,
  price
}: AssetTeaserProps) => {
  const { attributes } = ddo.findServiceByType('metadata')
  const { name, type } = attributes.main
  const { dataTokenInfo } = ddo
  const isCompute = Boolean(ddo?.findServiceByType('compute'))
  const accessType = isCompute ? 'compute' : 'access'
  const { owner } = ddo.publicKey[0]
  const { appConfig } = useSiteMetadata()

  const serviceEndpoint = ddo.findServiceByType(accessType)?.serviceEndpoint

  const url = new URL(window.location.href)
  const tutorial = url.pathname === '/tutorial'

  return (
    <article className={`${styles.teaser} ${styles[type]}`}>
      <LinkOpener
        uri={`/asset/${ddo.id}`}
        className={styles.link}
        openNewTab={tutorial}
      >
        <>
          <header className={styles.header}>
            <div className={styles.symbol}>{dataTokenInfo?.symbol}</div>
            <Dotdotdot clamp={3}>
              <h1 className={styles.title}>{name}</h1>
            </Dotdotdot>
            <Publisher account={owner} minimal className={styles.publisher} />
          </header>

          <AssetType
            type={type}
            accessType={accessType}
            className={styles.typeDetails}
          />

          <div className={styles.content}>
            <Dotdotdot tagName="p" clamp={3}>
              {removeMarkdown(
                attributes?.additionalInformation?.description || ''
              )}
            </Dotdotdot>
          </div>

          <footer className={styles.foot}>
            <Price price={price} small />
            <div className={styles.network}>
              {serviceEndpoint !== appConfig.providerUri && (
                <External className={styles.external} />
              )}
              <NetworkName networkId={ddo.chainId} />
            </div>
          </footer>
        </>
      </LinkOpener>
    </article>
  )
}

export default AssetTeaser
