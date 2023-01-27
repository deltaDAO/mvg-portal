import React, { ReactElement } from 'react'
import PublisherLinks from './PublisherLinks'
import Markdown from '../../../atoms/Markdown'
import Stats from './Stats'
import Account from './Account'
import styles from './index.module.css'
import { useProfile } from '../../../../providers/Profile'

export default function AccountHeader({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { profile } = useProfile()

  return (
    <div className={styles.grid}>
      <div>
        <Account accountId={accountId} />
        <Stats accountId={accountId} />
      </div>
      <div>
        <Markdown text={profile?.description} className={styles.description} />
        {profile?.links?.length > 0 && (
          <PublisherLinks className={styles.publisherLinks} />
        )}
      </div>
    </div>
  )
}
