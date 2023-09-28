import React, { ReactElement, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Tooltip from '../../../@shared/atoms/Tooltip'
import Details from './Details'
import Transaction from '@images/transaction.svg'
import Caret from '@images/caret.svg'
import Lock from '@images/lock.svg'
import classNames from 'classnames/bind'
import { automationConfig } from '../../../../../app.config'
import stylesIndex from '../index.module.css'
import styles from './index.module.css'

const cx = classNames.bind(styles)

export default function Automation(): ReactElement {
  const {
    autoWallet,
    isAutomationEnabled,
    hasValidEncryptedWallet,
    hasRetrievableBalance,
    hasAnyAllowance
  } = useAutomation()

  const [hasError, setHasError] = useState<boolean>()

  useEffect(() => {
    const setError = async () => {
      const balanceAvailable = await hasRetrievableBalance()
      setHasError(!balanceAvailable)
    }
    setError()
  }, [hasRetrievableBalance])

  const wrapperClasses = cx({
    automation: true,
    enabled: isAutomationEnabled
  })

  const indicatorClasses = cx({
    indicator: true,
    enabled: isAutomationEnabled,
    warning:
      automationConfig.useAutomationForErc20 === 'true' && !hasAnyAllowance(),
    error: hasError
  })

  return (
    <Tooltip
      content={<Details isFunded={!hasError} />}
      trigger="focus mouseenter click"
      placement="bottom"
      className={`${stylesIndex.preferences} ${wrapperClasses}`}
    >
      <div className={styles.wrapper}>
        {!autoWallet && hasValidEncryptedWallet() && (
          <Lock className={styles.lock} />
        )}
        <Transaction className={stylesIndex.icon} />
        {autoWallet && (
          <div className={indicatorClasses}>
            <div className={styles.indicatorPulse} />
          </div>
        )}
        {autoWallet && <Caret className={stylesIndex.caret} />}
      </div>
    </Tooltip>
  )
}
