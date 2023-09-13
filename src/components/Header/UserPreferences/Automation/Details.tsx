import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Balance from './Balance'
import ApproveToken from './ApproveToken'
import { tokenAddressesEUROe } from '../../../../@utils/subgraph'
import SendTransaction from './SendTransaction'
import { useChainId } from 'wagmi'
import { getOceanConfig } from '../../../../@utils/ocean'

export default function Details(): ReactElement {
  const { autoWallet, isAutomationEnabled, balance, allowance } =
    useAutomation()
  const chainId = useChainId()

  const [oceanTokenAddress, setOceanTokenAddress] = useState<`0x${string}`>()

  useEffect(() => {
    setOceanTokenAddress(
      getOceanConfig(chainId).oceanTokenAddress as `0x${string}`
    )
  }, [chainId])

  return (
    <div>
      {autoWallet?.wallet && (
        <Balance balance={balance} allowance={allowance} />
      )}
      {autoWallet?.wallet && <SendTransaction />}
      {autoWallet?.wallet && (
        <ApproveToken
          token={{
            address: tokenAddressesEUROe[chainId],
            symbol: 'EUROe',
            decimals: 6
          }}
          amount="1"
        />
      )}
      {autoWallet?.wallet && (
        <ApproveToken
          token={{
            address: oceanTokenAddress,
            symbol: 'OCEAN',
            decimals: 18
          }}
          amount="1"
        />
      )}
      {autoWallet?.wallet && (
        <ApproveToken
          token={{
            address: oceanTokenAddress,
            symbol: 'OCEAN',
            decimals: 18
          }}
          amount="0"
        />
      )}
    </div>
  )
}
