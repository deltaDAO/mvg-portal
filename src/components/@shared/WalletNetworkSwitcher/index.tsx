import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import useNetworkMetadata, {
  getNetworkDataById,
  getNetworkDisplayName
} from '@hooks/useNetworkMetadata'
import { useAsset } from '@context/Asset'
import { useNetwork, useSwitchNetwork } from 'wagmi'

export default function WalletNetworkSwitcher(): ReactElement {
  const { chain } = useNetwork()
  const { asset } = useAsset()
  const { switchNetwork } = useSwitchNetwork({
    chainId: asset?.credentialSubject?.chainId
  })
  const { networksList } = useNetworkMetadata()

  const ddoNetworkData = getNetworkDataById(
    networksList,
    asset.credentialSubject?.chainId
  )
  const walletNetworkData = getNetworkDataById(networksList, chain?.id)

  const ddoNetworkName = (
    <strong>{getNetworkDisplayName(ddoNetworkData)}</strong>
  )
  const walletNetworkName = (
    <strong>{getNetworkDisplayName(walletNetworkData)}</strong>
  )

  return (
    <div className={styles.networkWarning}>
      <div className={styles.tooltipWrapper}>
        <p className={styles.text}>Switch Network</p>
        <div className={styles.tooltip}>
          This asset is published on {ddoNetworkName} but your wallet is
          connected to {walletNetworkName}. Connect to {ddoNetworkName} to
          interact with this asset.
        </div>
      </div>

      <div className={styles.tooltipWrapper}>
        <button className={styles.button} onClick={() => switchNetwork()}>
          Switch Network
        </button>
        <div className={styles.tooltip}>
          Click to switch your wallet to {ddoNetworkName} network to interact
          with this asset.
        </div>
      </div>
    </div>
  )
}
