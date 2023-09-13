import React, { ReactElement, useCallback, useEffect, useState } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import Tooltip from '../../../@shared/atoms/Tooltip'
import Details from './Details'
import Transaction from '@images/transaction.svg'
import Caret from '@images/caret.svg'
import stylesIndex from '../index.module.css'
import styles from './index.module.css'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

enum AUTOMATION_STATES {
  CREATE,
  ENABLE,
  DISABLE
}

export default function Automation(): ReactElement {
  const {
    autoWallet,
    setIsAutomationEnabled,
    isAutomationEnabled,
    balance,
    allowance
  } = useAutomation()

  const [state, setState] = useState<AUTOMATION_STATES>()

  useEffect(() => {
    if (!autoWallet?.wallet) setState(AUTOMATION_STATES.CREATE)
    else if (isAutomationEnabled) setState(AUTOMATION_STATES.DISABLE)
    else setState(AUTOMATION_STATES.ENABLE)
  }, [autoWallet, isAutomationEnabled])

  const getActionText = useCallback(() => {
    return state === AUTOMATION_STATES.ENABLE
      ? 'Enable'
      : state === AUTOMATION_STATES.DISABLE
      ? 'Disable'
      : 'Activate'
  }, [state])

  const wrapperClasses = cx({
    automation: true,
    enabled: isAutomationEnabled
  })

  const indicatorClasses = cx({
    indicator: true,
    enabled: isAutomationEnabled,
    warning:
      Object.keys(allowance).filter((token) => Number(allowance[token]) <= 0)
        .length > 0,
    error:
      Object.keys(balance).filter((token) => Number(balance[token]) <= 0)
        .length > 0
  })

  return (
    <Tooltip
      content={<Details />}
      trigger="focus mouseenter"
      disabled={!autoWallet?.wallet}
      placement="bottom"
      className={`${stylesIndex.preferences} ${wrapperClasses}`}
    >
      <div title={`${getActionText()} automation`}>
        <Transaction
          onClick={() => setIsAutomationEnabled(!isAutomationEnabled)}
          className={stylesIndex.icon}
        />
        {autoWallet?.wallet && (
          <div className={indicatorClasses}>
            <div className={styles.indicatorPulse} />
          </div>
        )}
        {autoWallet?.wallet && <Caret className={stylesIndex.caret} />}
      </div>
    </Tooltip>
  )
}
