import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Balance from './Balance'
import { toast } from 'react-toastify'
import { useChainId } from 'wagmi'
import { getOceanConfig } from '../../../../@utils/ocean'
import { accountTruncate } from '../../../../@utils/wallet'
import Button from '../../../@shared/atoms/Button'
import Copy from '../../../@shared/atoms/Copy'
import styles from './Details.module.css'
import FundWallet from './FundWallet'
import WithdrawTokens from './WithdrawTokens'

export default function Details(): ReactElement {
  const {
    autoWallet,
    isAutomationEnabled,
    balance,
    setIsAutomationEnabled,
    deleteCurrentAutomationWallet
  } = useAutomation()
  const chainId = useChainId()

  const [oceanTokenAddress, setOceanTokenAddress] = useState<`0x${string}`>()

  useEffect(() => {
    setOceanTokenAddress(
      getOceanConfig(chainId).oceanTokenAddress as `0x${string}`
    )
  }, [chainId])

  const deleteWallet = () => {
    if (
      !confirm(
        `The automation wallet still owns ${balance.eth} network tokens. Do you want to continue?`
      )
    )
      return

    deleteCurrentAutomationWallet()
    toast.info('The automation wallet was removed from your machine.')
  }

  return (
    <div className={styles.details}>
      <Button
        style="primary"
        onClick={() => {
          setIsAutomationEnabled(!isAutomationEnabled)
        }}
        className={styles.toggleBtn}
      >
        {isAutomationEnabled ? 'Disable automation' : 'Enable automation'}
      </Button>

      <span className={styles.walletAddress}>
        Address: <strong>{accountTruncate(autoWallet?.wallet?.address)}</strong>
        <Copy text={autoWallet?.wallet?.address} />
      </span>

      <Balance />

      <FundWallet className={styles.fundingBtn} />

      <WithdrawTokens className={styles.withdrawBtn} />
      <Button onClick={() => deleteWallet()} className={styles.deleteBtn}>
        Delete Wallet
      </Button>
    </div>
  )
}
