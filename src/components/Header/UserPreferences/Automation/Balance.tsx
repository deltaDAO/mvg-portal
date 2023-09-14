import React, { ReactElement } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import styles from './Balance.module.css'

export default function Balance(): ReactElement {
  const { balance, allowance } = useAutomation()

  return (
    <div className={styles.wrapper}>
      <div className={styles.balance}>
        <strong>Balance</strong>
        <ul>
          {Object.keys(balance).map((currency) => (
            <li key={`balance-${currency}`}>
              <span>{currency}</span>: {Number(balance[currency]).toFixed(4)}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.allowance}>
        <strong>Allowance</strong>
        <ul>
          {Object.keys(allowance).map((currency) => (
            <li key={`allowance-${currency}`}>
              <span>{currency}</span>: {Number(allowance[currency]).toFixed(4)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
