import { ReactElement, useEffect, useState } from 'react'
import {
  AUTOMATION_MODES,
  useAutomation
} from '../../../../@context/Automation/AutomationProvider'
import { useMarketMetadata } from '../../../../@context/MarketMetadata'
import { useUserPreferences } from '../../../../@context/UserPreferences'
import Button from '../../../@shared/atoms/Button'
import Balance from './Balance'
import styles from './Details.module.css'
import Import from './Import'
import Address from './Address'
import Decrypt from './Decrypt'

function AdvancedView(): ReactElement {
  const { deleteCurrentAutomationWallet } = useAutomation()

  return (
    <div className={styles.advanced}>
      <Balance />

      <Button
        onClick={() => deleteCurrentAutomationWallet()}
        className={styles.deleteBtn}
      >
        Delete Wallet
      </Button>
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
      {isFunded && roughTxCountEstimate && roughTxCountEstimate > 0 ? (
        <>
          <span className={styles.success}>
            Automation available for roughly {roughTxCountEstimate.toFixed(0)}{' '}
            transactions.
          </span>
        </>
      ) : (
        <>
          <span className={styles.error}>
            Automation not sufficiently funded!
          </span>
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
    balance,
    isAutomationEnabled,
    isLoading,
    hasValidEncryptedWallet,
    setIsAutomationEnabled
  } = useAutomation()

  const { automationConfig } = useMarketMetadata().appConfig
  const { automationWalletMode } = useUserPreferences()

  const [roughTxCountEstimate, setRoughTxCountEstimate] = useState<number>()
  const [needsImport, setNeedsImport] = useState<boolean>(
    !hasValidEncryptedWallet
  )

  useEffect(() => {
    setNeedsImport(!hasValidEncryptedWallet)
  }, [hasValidEncryptedWallet])

  useEffect(() => {
    if (!automationConfig.roughTxGasEstimate) return
    setRoughTxCountEstimate(
      Number(balance.native.balance) / automationConfig.roughTxGasEstimate
    )
  }, [balance.native, automationConfig?.roughTxGasEstimate])

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
          {automationWalletMode === AUTOMATION_MODES.SIMPLE ? (
            <SimpleView
              isFunded={isFunded}
              roughTxCountEstimate={roughTxCountEstimate}
            />
          ) : (
            <AdvancedView />
          )}
        </>
      )}

      {/* IMPORT / EXPORT */}
      {!autoWallet && (needsImport ? <Import /> : <Decrypt />)}
    </div>
  )
}
