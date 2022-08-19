import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../@types/edge/DDO'
import styles from './EdgeAssetDetails.module.css'
import NumberUnit from '../molecules/NumberUnit'

export default function EdgeAssetDetails({
  ddo
}: {
  ddo: EdgeDDO
}): ReactElement {
  const service = ddo.findServiceByType('edge')
  const assetModel = service?.attributes?.main?.provider?.device?.model
  const numberOfAvailableAssets =
    service?.attributes?.main?.availableServices?.length
  return (
    <div className={styles.container}>
      {assetModel && (
        <NumberUnit label={assetModel} value={numberOfAvailableAssets || 0} />
      )}
    </div>
  )
}
