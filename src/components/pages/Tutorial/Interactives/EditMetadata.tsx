import styles from './ConnectWallet.module.css'
import React from 'react'
import { ReactElement } from 'react-markdown'
import EditComputeDataset from '../../../organisms/AssetActions/Edit/EditComputeDataset'
import PageTemplateAssetDetails from '../../../templates/PageAssetDetails'
import { useAsset } from '../../../../providers/Asset'
import PageHeader from '../../../molecules/PageHeader'

export default function EditMetadata({
  showPriceTutorial,
  showComputeTutorial,
  setShowComputeTutorial
}: {
  showPriceTutorial: boolean
  showComputeTutorial: boolean
  setShowComputeTutorial: (value: boolean) => void
}): ReactElement {
  const { ddo } = useAsset()
  return (
    <>
      {ddo && showPriceTutorial && (
        <>
          {!showComputeTutorial && (
            <div className={styles.wrapper}>
              <PageHeader
                title="Choose the algorithm here"
                description="Only selected algorithms are allowed to run on this dataset. Updating these settings will create an on-chain transaction you have to approve with your wallet."
              />
              <div className={styles.compute}>
                <EditComputeDataset
                  tutorial
                  setShowEdit={setShowComputeTutorial}
                />
              </div>
            </div>
          )}
          {showComputeTutorial && (
            <PageTemplateAssetDetails
              uri={`/tutorial/${ddo.id}`}
              setShowComputeTutorial={setShowComputeTutorial}
            />
          )}
        </>
      )}
    </>
  )
}
