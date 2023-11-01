import { ReactElement } from 'react'
import Stats from './Stats'
import Account from './Account'
import styles from './index.module.css'
import Button from '../../@shared/atoms/Button'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { autoWalletAddress } = useAutomation()

  return (
    <div className={styles.grid}>
      <div>
        <Account accountId={accountId} />
        <Stats />
      </div>
      {autoWalletAddress && autoWalletAddress !== accountId && (
        <div className={styles.automation}>
          <Button style="text" to={`/profile/${autoWalletAddress}`}>
            View Automation Account
          </Button>
        </div>
      )}
    </div>
  )
}
