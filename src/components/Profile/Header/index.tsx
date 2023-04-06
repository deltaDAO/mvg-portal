import React, { ReactElement } from 'react'
import Stats from './Stats'
import Account from './Account'
import styles from './index.module.css'
import DmButton from '@shared/DirectMessages/DmButton'

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  return (
    <div className={styles.grid}>
      <div>
        <Account accountId={accountId} />
        <Stats />
      </div>

      <div>
        <div className={styles.directMessage}>
          <DmButton accountId={accountId} />
        </div>
      </div>
    </div>
  )
}
