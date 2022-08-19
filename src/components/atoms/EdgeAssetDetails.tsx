import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../@types/edge/DDO'
import styles from './EdgeAssetDetails.module.css'
import { ReactComponent as Online } from '../../images/online.svg'
import classNames from 'classnames/bind'

const cx = classNames.bind(styles)

export default function EdgeAssetDetails({
  ddo
}: {
  ddo: EdgeDDO
}): ReactElement {
  const service = ddo.findServiceByType('edge')
  const assetModel = service?.attributes?.main?.provider?.device?.model
  const numberOfAvailableAssets =
    service?.attributes?.main?.availableServices?.length

  const iconStyles = cx({
    icon: true,
    unavailable: !numberOfAvailableAssets
  })
  return (
    <div className={styles.container}>
      {assetModel && (
        <div className={styles.detailsContainer}>
          <Online
            role="img"
            aria-label="online assets"
            className={iconStyles}
          />
          <div className={styles.details}>
            <span className={styles.model}>{assetModel}</span>
            <span className={styles.availableAssets}>
              {`${numberOfAvailableAssets || 0} available assets`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
