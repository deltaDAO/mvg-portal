import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../@types/edge/DDO'
import styles from './EdgeAssetTeaserDetails.module.css'
import classNames from 'classnames/bind'
import Badge from './Badge'

const cx = classNames.bind(styles)

export default function EdgeAssetTeaserDetails({
  ddo
}: {
  ddo: EdgeDDO
}): ReactElement {
  const service = ddo.findServiceByType('edge')
  const assetModel = service?.attributes?.main?.provider?.device?.model
  const numberOfAvailableAssets =
    service?.attributes?.main?.availableServices?.length

  const badgeStyles = cx({
    badge: true,
    unavailable: !numberOfAvailableAssets
  })
  return (
    <div className={styles.container}>
      {assetModel && (
        <div className={styles.details}>
          <div>
            <span className={styles.model}>{assetModel}</span>
            <Badge
              label={numberOfAvailableAssets ? 'online' : 'offline'}
              className={badgeStyles}
            />
          </div>
          <span className={styles.availableAssets}>
            {`${numberOfAvailableAssets || 0} available assets`}
          </span>
        </div>
      )}
    </div>
  )
}
