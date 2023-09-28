import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import { useMarketMetadata } from '../../../../@context/MarketMetadata'
import { useUserPreferences } from '../../../../@context/UserPreferences'
import Button from '../../../@shared/atoms/Button'
import Loader from '../../../@shared/atoms/Loader'
import { AUTOMATION_WALLET_MODES } from '../AutomationWalletMode'
import Balance from './Balance'
import styles from './Details.module.css'
import FundWallet from './FundWallet'
import WithdrawTokens from './WithdrawTokens'
import Import from './Import'
import Address from './Address'
import Decrypt from './Decrypt'

function AdvancedView(): ReactElement {
  return (
    <div className={styles.advanced}>
      <Balance />

      <FundWallet className={styles.fundingBtn} />

      <WithdrawTokens className={styles.withdrawBtn} />
    </div>
  )
}

function SimpleView({
  isFunded,
  roughTxCountEstimate
}: {
  isFunded: boolean
  roughTxCountEstimate?: number
}): ReactElement {
  return (
    <div className={styles.simple}>
      {isFunded ? (
        <>
          {roughTxCountEstimate && (
            <span className={styles.success}>
              Automation available for roughly {roughTxCountEstimate.toFixed(0)}{' '}
              transactions.
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
  )
}

export default function Details({
  isFunded
}: {
  isFunded: boolean
}): ReactElement {
  const {
    autoWallet,
    autoWalletAddress,
    isAutomationEnabled,
    balance,
    isLoading,
    setIsAutomationEnabled,
    deleteCurrentAutomationWallet,
    exportAutomationWallet,
    hasValidEncryptedWallet
  } = useAutomation()

  const { automationConfig } = useMarketMetadata().appConfig
  const { automationWalletMode } = useUserPreferences()

  const [roughTxCountEstimate, setRoughTxCountEstimate] = useState<number>()
  const [needsImport, setNeedsImport] = useState<boolean>(
    !hasValidEncryptedWallet()
  )

  useEffect(() => {
    setNeedsImport(!hasValidEncryptedWallet())
  }, [hasValidEncryptedWallet])

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
      {/* DESCRIPTION */}
      <strong className={styles.title}>Automation</strong>
      <div className={styles.help}>
        Automate transactions using an imported wallet of your choice.
      </div>

      {/* EN-/DISABLE */}
      {autoWallet?.address && (
        <Button
          style="primary"
          onClick={() => {
            setIsAutomationEnabled(!isAutomationEnabled)
          }}
          className={styles.toggleBtn}
        >
          {isAutomationEnabled ? 'Disable automation' : 'Enable automation'}
        </Button>
      )}

      {/* AUTOMATION ADDRESS */}
      {autoWalletAddress && (
        <Address showDelete={autoWallet === undefined && !isLoading} />
      )}

      {/* MAIN AUTOMATION SECTION */}
      {autoWallet && (
        <>
          {automationWalletMode === AUTOMATION_WALLET_MODES.SIMPLE ? (
            <SimpleView
              isFunded={isFunded}
              roughTxCountEstimate={roughTxCountEstimate}
            />
          ) : (
            <AdvancedView />
          )}

          <Button onClick={() => deleteWallet()} className={styles.deleteBtn}>
            Delete Wallet
          </Button>
        </>
      )}

      {/* IMPORT / EXPORT */}
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
      ) : needsImport ? (
        <Import />
      ) : (
        <Decrypt />
      )}
    </div>
  )
}
