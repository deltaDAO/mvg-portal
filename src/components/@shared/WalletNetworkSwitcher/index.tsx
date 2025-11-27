import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
import styles from './index.module.css'
import useNetworkMetadata, {
  getNetworkDataById,
  getNetworkDisplayName
} from '@hooks/useNetworkMetadata'
import { useAsset } from '@context/Asset'
import { useChainId, useSwitchChain } from 'wagmi'

export default function WalletNetworkSwitcher(): ReactElement {
  const chainId = useChainId()
  const { asset } = useAsset()
  const { switchChain } = useSwitchChain()
  const { networksList } = useNetworkMetadata()

  const ddoNetworkId = asset.credentialSubject?.chainId

  const ddoNetworkData = getNetworkDataById(networksList, ddoNetworkId)
  const walletNetworkData = getNetworkDataById(networksList, chainId)

  const ddoNetworkName = (
    <strong>{getNetworkDisplayName(ddoNetworkData)}</strong>
  )
  const walletNetworkName = (
    <strong>{getNetworkDisplayName(walletNetworkData)}</strong>
  )

  const handleSwitchChain = () => {
    if (ddoNetworkId) {
      switchChain({ chainId: ddoNetworkId })
    }
  }

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
        <button className={styles.button} onClick={handleSwitchChain}>
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
