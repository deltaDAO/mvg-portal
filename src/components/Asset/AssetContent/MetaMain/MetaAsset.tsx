import { useAsset } from '@context/Asset'
import AddToken from '@shared/AddToken'
import ExplorerLink from '@shared/ExplorerLink'
import Publisher from '@shared/Publisher'
import { ReactElement } from 'react'
import { useAccount } from 'wagmi'
import styles from './MetaAsset.module.css'
import { Asset } from 'src/@types/Asset'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function MetaAsset({
  asset,
  isBlockscoutExplorer
}: {
  asset: AssetExtended
  isBlockscoutExplorer: boolean
}): ReactElement {
  const { isAssetNetwork } = useAsset()
  const { connector: activeConnector } = useAccount()

  const dataTokenSymbol = asset?.credentialSubject?.datatokens[0]?.symbol

  return (
    <div className={styles.wrapper}>
      <span className={styles.owner}>
        Owned by <Publisher account={asset?.credentialSubject?.nft?.owner} />
      </span>
      <span>
        <ExplorerLink
          className={styles.datatoken}
          networkId={asset?.credentialSubject?.chainId}
          path={
            isBlockscoutExplorer
              ? `tokens/${asset?.credentialSubject?.services[0]?.datatokenAddress}`
              : `token/${asset?.credentialSubject?.services[0]?.datatokenAddress}`
          }
        >
          {`Accessed with ${dataTokenSymbol}`}
        </ExplorerLink>
        {activeConnector?.name === 'MetaMask' && isAssetNetwork && (
          <span className={styles.addWrap}>
            <AddToken
              address={asset?.credentialSubject?.services[0].datatokenAddress}
              symbol={
                (asset as Asset).credentialSubject?.datatokens?.[0]?.symbol
              }
              text={`Add ${
                (asset as Asset)?.credentialSubject?.datatokens?.[0]?.symbol
              } to wallet`}
              className={styles.add}
              minimal
            />
          </span>
        )}
      </span>
    </div>
  )
}
