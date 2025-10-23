import Button from '@components/@shared/atoms/Button'
import EthIcon from '@images/eth.svg'
import { useSwitchNetwork } from 'wagmi'
import styles from './index.module.css'

interface SwitchNetworkProps {
  chainId: number
  targetNetwork: number
}

export const SwitchNetwork = ({
  chainId,
  targetNetwork
}: Readonly<SwitchNetworkProps>) => {
  const { switchNetwork } = useSwitchNetwork()

  if (chainId === targetNetwork)
    return (
      <div className={styles.chainMessage}>
        Correct network {chainId}
        <EthIcon />
      </div>
    )

  return (
    <Button
      style="text"
      type="button"
      onClick={() => {
        switchNetwork(targetNetwork)
      }}
      className={styles.button}
    >
      Switch to asset&apos;s network
    </Button>
  )
}
