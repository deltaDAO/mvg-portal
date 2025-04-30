import { ReactElement } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import styles from './Balance.module.css'

export default function Balance(): ReactElement {
  const { balance } = useAutomation()

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.balance}>
          <ul>
            {balance.native && (
              <li key={`automation-balance-${balance.native.symbol}`}>
                <span>{balance.native.symbol}</span>:{' '}
                {Number(balance.native.balance).toFixed(4)}
              </li>
            )}
          </ul>
        </div>
        <div className={styles.balance}>
          <ul>
            {balance.approved &&
              Object.keys(balance.approved).map((currency) => (
                <li key={`automation-balance-${currency}`}>
                  <span>{currency}</span>:{' '}
                  {Number(balance.approved[currency]).toFixed(4)}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}
