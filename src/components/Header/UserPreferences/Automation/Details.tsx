import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Balance from './Balance'
import { toast } from 'react-toastify'
import { accountTruncate } from '../../../../@utils/wallet'
import Button from '../../../@shared/atoms/Button'
import Copy from '../../../@shared/atoms/Copy'
import styles from './Details.module.css'
import FundWallet from './FundWallet'
import WithdrawTokens from './WithdrawTokens'
import { useMarketMetadata } from '../../../../@context/MarketMetadata'
import { useUserPreferences } from '../../../../@context/UserPreferences'
import { AUTOMATION_WALLET_MODES } from '../AutomationWalletMode'
import Loader from '../../../@shared/atoms/Loader'

export default function Details({
  isFunded
}: {
  isFunded: boolean
}): ReactElement {
  const {
    autoWallet,
    isAutomationEnabled,
    balance,
    isLoading,
    setIsAutomationEnabled,
    deleteCurrentAutomationWallet,
    exportAutomationWallet,
    importAutomationWallet
  } = useAutomation()

  const { automationConfig } = useMarketMetadata().appConfig

  const { automationWalletMode } = useUserPreferences()

  const [roughTxCountEstimate, setRoughTxCountEstimate] = useState<number>()

  useEffect(() => {
    if (!automationConfig.roughTxGasEstimate || !balance) return
    setRoughTxCountEstimate(
      Number(balance.eth) / automationConfig.roughTxGasEstimate
    )
  }, [balance, automationConfig?.roughTxGasEstimate])

  const deleteWallet = () => {
    deleteCurrentAutomationWallet()
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

      {autoWallet?.wallet?.address && (
        <span className={styles.walletAddress}>
          Address:{' '}
          <strong>{accountTruncate(autoWallet?.wallet?.address)}</strong>
          <Copy text={autoWallet?.wallet?.address} />
        </span>
      )}

      {autoWallet?.wallet && (
        <>
          {automationWalletMode === AUTOMATION_WALLET_MODES.SIMPLE ? (
            <div className={styles.simple}>
              {isFunded ? (
                <>
                  {roughTxCountEstimate && (
                    <span className={styles.success}>
                      Automation available for roughly{' '}
                      {roughTxCountEstimate.toFixed(0)} transactions.
                    </span>
                  )}
                  <WithdrawTokens>Empty Wallet</WithdrawTokens>
                </>
              ) : (
                <>
                  <span className={styles.error}>
                    Automation not sufficiently funded!
                  </span>
                  <FundWallet style="primary">Recharge wallet</FundWallet>
                </>
              )}
            </div>
          ) : (
            <>
              <Balance />

              <FundWallet className={styles.fundingBtn} />

              <WithdrawTokens className={styles.withdrawBtn} />
            </>
          )}

          <Button onClick={() => deleteWallet()} className={styles.deleteBtn}>
            Delete Wallet
          </Button>
        </>
      )}

      {autoWallet ? (
        <Button
          onClick={async () => {
            const password = prompt('Enter your password:')
            await exportAutomationWallet(password)
          }}
          className={styles.deleteBtn}
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : `Export Wallet`}
        </Button>
      ) : (
        <>
          <input type="file" id="walletImport" />
          <Button
            onClick={async () => {
              const password = prompt('Password:')
              // @ts-ignore
              const filename = document.getElementById('walletImport').files[0]
              const reader = new FileReader()
              reader.readAsText(filename)
              reader.onload = async (event) => {
                await importAutomationWallet(
                  event.target.result.toString(),
                  password
                )
              }
            }}
            className={styles.deleteBtn}
            disabled={isLoading}
          >
            {isLoading ? <Loader /> : `Import Wallet`}
          </Button>
        </>
      )}
    </div>
  )
}
