import React from 'react'
import { ReactElement } from 'react-markdown'
import styles from './ViewHistory.module.css'
import PageHeader from '../../../molecules/PageHeader'
import PageHistory from '../../History'

export default function ViewHistory({
  showPriceTutorial,
  showComputeTutorial
}: {
  showPriceTutorial: boolean
  showComputeTutorial: boolean
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
          <PageHistory />
        </div>
      )}
    </>
  )
}
