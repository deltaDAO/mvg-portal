import { ReactElement } from 'react'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import styles from './Balance.module.css'

export default function Balance(): ReactElement {
  const { nativeBalance, balance } = useAutomation()

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.balance}>
          <ul>
            {nativeBalance && (
              <li key={`automation-balance-${nativeBalance.symbol}`}>
                <span>{nativeBalance.symbol}</span>:{' '}
                {Number(nativeBalance.balance).toFixed(4)}
              </li>
            )}
          </ul>
        </div>
        <div className={styles.balance}>
          <ul>
            {balance &&
              Object.keys(balance).map((currency) => (
                <li key={`automation-balance-${currency}`}>
                  <span>{currency}</span>:{' '}
                  {Number(balance[currency]).toFixed(4)}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}
