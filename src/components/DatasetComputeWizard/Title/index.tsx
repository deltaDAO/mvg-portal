import { ReactElement } from 'react'
import NetworkName from '@shared/NetworkName'
import Tooltip from '@shared/atoms/Tooltip'
import styles from './index.module.css'
import Info from '@images/info.svg'
import AvailableNetworks from '@components/Publish/AvailableNetworks'
import useNetworkMetadata from '@hooks/useNetworkMetadata'
import { useAccount } from 'wagmi'
import { AssetExtended } from 'src/@types/AssetExtended'

export default function Title({
  asset
}: {
  asset: AssetExtended
}): ReactElement {
  const { address: accountId } = useAccount()
  const { isSupportedOceanNetwork } = useNetworkMetadata()
  const networkId = asset?.credentialSubject?.chainId

  return (
    <div className={styles.titleContainer}>
      <span className={styles.titleText}>Buy Dataset</span>
    </div>
  )
}
