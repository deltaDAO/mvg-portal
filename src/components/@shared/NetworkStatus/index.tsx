import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useNetwork } from 'wagmi'
import { useMarketMetadata } from '../../../@context/MarketMetadata'
import Alert from '../atoms/Alert'
import axios from 'axios'
import { LoggerInstance } from '@oceanprotocol/lib'

export default function NetworkStatus({
  className
}: {
  className?: string
}): ReactElement {
  const [showNetworkAlert, setShowNetworkAlert] = useState(false)
  const [network, setNetwork] = useState<string>()
  const { appConfig } = useMarketMetadata()
  const { chain } = useNetwork()

  // Refresh interval for network status - 30 sec
  const refreshInterval = 30000
  // Margin of error for block count (how much difference between min / max block numbers before showing an alert)
  const errorMargin = 5

  const fetchNetworkStatus = useCallback(
    async (chainId: number) => {
      if (!chainId) return
      setNetwork(chain?.name)
      const apiEndpoint = appConfig.networkAlertApi[chainId]
      if (!apiEndpoint) return
      LoggerInstance.log(`[NetworkStatus] retrieving network status`, {
        apiEndpoint
      })
      try {
        const result = await axios.get(apiEndpoint, {
          proxy: {
            host: appConfig.networkAlertApi[chainId].split(':8000')[0],
            port: 8000
          }
        })
        const { Nodes } = result.data
        const { nodes }: { nodes: { [node: string]: number } } = Nodes
        let minBlock: number
        let maxBlock: number
        Object.values(nodes).forEach((block) => {
          if (!minBlock || block < minBlock) minBlock = block
          if (!maxBlock || block > maxBlock) maxBlock = block
        })
        const hasError = maxBlock - minBlock > errorMargin
        setShowNetworkAlert(hasError)
        LoggerInstance.log(`[NetworkStatus] network status updated:`, {
          minBlock,
          maxBlock,
          hasError
        })
      } catch (error) {
        LoggerInstance.error(
          `[NetworkStatus] could not retrieve network status:`,
          error.message
        )
      }
    },
    [appConfig.networkAlertApi]
  )

  useEffect(() => {
    if (!chain?.id) return

    fetchNetworkStatus(chain?.id)

    // init periodic refresh for network status
    const networkStatusInterval = setInterval(
      () => fetchNetworkStatus(chain?.id),
      refreshInterval
    )

    return () => {
      clearInterval(networkStatusInterval)
    }
  }, [chain, fetchNetworkStatus])

  return (
    showNetworkAlert && (
      <Alert
        state="warning"
        text="The network is currently undergoing maintenance, which may cause instabilities or transaction delays. Please try again later if you run into issues."
        title="Network Status"
        badge={network || chain?.id.toString()}
        onDismiss={() => setShowNetworkAlert(false)}
        className={className}
      />
    )
  )
}
