import { ReactElement } from 'react'
import { accountTruncate } from '../../../../@utils/wallet'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import { useUserPreferences } from '../../../../@context/UserPreferences'
import Copy from '../../../@shared/atoms/Copy'
import Cross from '@images/cross.svg'
import styles from './Address.module.css'
import Button from '../../../@shared/atoms/Button'

export default function Address({
  showDelete
}: {
  showDelete: boolean
}): ReactElement {
  const { autoWalletAddress } = useAutomation()
  const { setAutomationWalletJSON } = useUserPreferences()

  return (
    <div className={styles.address}>
      <span>
        Address: <strong>{accountTruncate(autoWalletAddress)}</strong>
        <Copy text={autoWalletAddress} />
      </span>
      {showDelete && (
        <Button
          onClick={() => setAutomationWalletJSON(undefined)}
          className={styles.delete}
          title="Delete"
          style="text"
          size="small"
        >
          <Cross />
        </Button>
      )}
    </div>
  )
}
