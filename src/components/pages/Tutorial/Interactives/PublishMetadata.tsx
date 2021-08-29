import React, { useEffect, useRef } from 'react'
import { ReactElement } from 'react-markdown'
import Loader from '../../../atoms/Loader'
import SuccessConfetti from '../../../atoms/SuccessConfetti'
import AssetTeaser from '../../../molecules/AssetTeaser'
import Pricing from '../../../organisms/AssetContent/Pricing'
import PagePublish from '../../Publish'
import StylesTeaser from '../../../molecules/MetadataFeedback.module.css'
import { DDO } from '@oceanprotocol/lib'
import { useAsset } from '../../../../providers/Asset'
import PageHeader from '../../../molecules/PageHeader'
import styles from './PublishMetadata.module.css'

export default function PublishMetadata({
  showPriceTutorial,
  setTutorialDdo,
  setShowPriceTutorial
}: {
  showPriceTutorial: boolean
  setTutorialDdo: (value: DDO) => void
  setShowPriceTutorial: (value: boolean) => void
}): ReactElement {
  const { ddo, price, refreshDdo, loading } = useAsset()
  const confettiRef = useRef(null)
  const executeScroll = () =>
    confettiRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
  useEffect(() => {
    if (showPriceTutorial && loading) {
      executeScroll()
    }
  }, [showPriceTutorial])

  return (
    <div className={styles.wrapper}>
      <PageHeader
        title="Publish"
        description="You are able to publish your dataset within the tutorial. Feel free to use our demo dataset linked below."
      />
      {!showPriceTutorial && (
        <PagePublish
          content={{
            warning: ''
          }}
          datasetOnly
          tutorial
          ddo={ddo}
          setTutorialDdo={setTutorialDdo}
          loading={loading}
        />
      )}
      {ddo && !showPriceTutorial && !loading && (
        <div className={styles.price}>
          <h3>Set a price for your published dataset</h3>
          <p>Set a price for your data asset</p>
          <Pricing
            ddo={ddo}
            tutorial
            setShowPriceTutorial={setShowPriceTutorial}
            refreshDdo={refreshDdo}
          />
        </div>
      )}
      {ddo && showPriceTutorial && loading && (
        <div className={StylesTeaser.feedback} ref={confettiRef}>
          <div className={StylesTeaser.box}>
            <Loader />
          </div>
        </div>
      )}
      {ddo && showPriceTutorial && !loading && (
        <>
          <div className={StylesTeaser.feedback}>
            <div className={StylesTeaser.box}>
              <h3>🎉 Congratulations 🎉</h3>
              <SuccessConfetti
                success="You successfully set the price for your dataset."
                action={
                  <div className={StylesTeaser.teaser}>
                    <AssetTeaser ddo={ddo} price={price} />
                  </div>
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
