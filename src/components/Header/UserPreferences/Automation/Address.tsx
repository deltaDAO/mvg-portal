import { ReactElement } from 'react'
import { accountTruncate } from '../../../../@utils/wallet'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'
import { useUserPreferences } from '../../../../@context/UserPreferences'
import Copy from '../../../@shared/atoms/Copy'
import Cross from '@images/cross.svg'
import styles from './Address.module.css'
import Button from '../../../@shared/atoms/Button'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function Address({
  showDelete,
  className
}: {
  showDelete: boolean
  className?: string
}): ReactElement {
  const { autoWalletAddress } = useAutomation()
  const { setAutomationWalletJSON } = useUserPreferences()

  return (
    <div className={cx({ address: true, [className]: className })}>
      <span>
        Address: <strong>{accountTruncate(autoWalletAddress)}</strong>
        <Copy text={autoWalletAddress} />
      </span>
      {showDelete && (
        <Button
          onClick={() => setAutomationWalletJSON('')}
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
