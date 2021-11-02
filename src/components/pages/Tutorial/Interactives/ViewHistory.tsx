import React from 'react'
import { ReactElement } from 'react-markdown'
import styles from './ViewHistory.module.css'
import PageHeader from '../../../molecules/PageHeader'
import PageHistory from '../../Profile/History'

export default function ViewHistory({
  showPriceTutorial,
  showComputeTutorial,
  accountId
}: {
  showPriceTutorial: boolean
  showComputeTutorial: boolean
  accountId: string
}): ReactElement {
  return (
    <>
      {showPriceTutorial && showComputeTutorial && (
        <div className={styles.wrapper}>
          <PageHeader
            title="History"
            description="Find the Data Services that you previously accessed."
            center
          />
          <PageHistory accountIdentifier={accountId} />
        </div>
      )}
    </>
  )
}
