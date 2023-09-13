import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import Button from '../../@shared/atoms/Button'
import SendTransaction from './SendTransaction'
import { tokenAddressesEUROe } from '../../../@utils/subgraph'
import { useChainId } from 'wagmi'
import { getOceanConfig } from '../../../@utils/ocean'
import ApproveToken from './ApproveToken'

export default function Automation(): ReactElement {
  const {
    autoWallet,
    setIsAutomationEnabled,
    isAutomationEnabled,
    balance,
    allowance
  } = useAutomation()

  const [actionText, setActionText] = useState<string>()
  const chainId = useChainId()

  const [oceanTokenAddress, setOceanTokenAddress] = useState<`0x${string}`>()

  useEffect(() => {
    setOceanTokenAddress(
      getOceanConfig(chainId).oceanTokenAddress as `0x${string}`
    )
  }, [chainId])

  useEffect(() => {
    if (!autoWallet?.wallet) setActionText('Activate')
    else if (isAutomationEnabled) setActionText('Disable')
    else setActionText('Enable')
  }, [autoWallet, isAutomationEnabled])

  return (
    <>
      <Button
        onClick={() => setIsAutomationEnabled(!isAutomationEnabled)}
        style={isAutomationEnabled ? undefined : 'primary'}
      >
        {actionText} Automation
        {isAutomationEnabled && (
          <>
            {' ('}
            <span>
              {Object.keys(balance).map(
                (currency) => `${currency}: ${balance[currency]} - `
              )}
            </span>
            <span>
              {Object.keys(allowance).map(
                (currency) => `${currency}: ${allowance[currency]} - `
              )}
            </span>
            {')'}
          </>
        )}
      </Button>
      {isAutomationEnabled && <SendTransaction />}
      {isAutomationEnabled && (
        <ApproveToken
          token={{
            address: tokenAddressesEUROe[chainId],
            symbol: 'EUROe',
            decimals: 6
          }}
          amount="1"
        />
      )}
      {isAutomationEnabled && (
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
    </>
  )
}
