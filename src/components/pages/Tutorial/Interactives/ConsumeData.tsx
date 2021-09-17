import React, { useState, useEffect, ReactElement } from 'react'
import Alert from '../../../atoms/Alert'
import Loader from '../../../atoms/Loader'
import { useAsset } from '../../../../providers/Asset'
import AssetActions from '../../../organisms/AssetActions'
import styles from '../../../organisms/AssetContent/index.module.css'
import PageHeader from '../../../molecules/PageHeader'

export default function ConsumeData({
  showPriceTutorial,
  showComputeTutorial
}: {
  showPriceTutorial: boolean
  showComputeTutorial: boolean
}): ReactElement {
  const { ddo, title, error, isInPurgatory, loading } = useAsset()
  const [pageTitle, setPageTitle] = useState<string>()

  useEffect(() => {
    if (!ddo || error) {
      setPageTitle('Could not retrieve asset')
      return
    }

    setPageTitle(isInPurgatory ? '' : title)
  }, [ddo, error, isInPurgatory, title])

  return (
    <div className={styles.wrapper}>
      {showPriceTutorial &&
      showComputeTutorial &&
      ddo &&
      pageTitle !== undefined &&
      !loading ? (
        <>
          <PageHeader title={pageTitle} center />
          <div className={styles.actions}>
            <AssetActions />
          </div>
        </>
      ) : error ? (
        <Alert title={pageTitle} text={error} state="error" />
      ) : loading ? (
        <>
          <PageHeader title={pageTitle} center />
          <Loader />
        </>
      ) : (
        <Alert
          title="Consumption of a Data Service"
          text="Please finish the above chapters first."
          state="info"
        />
      )}
    </div>
  )
}
