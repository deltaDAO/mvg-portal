import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../@types/edge/DDO'
import styles from './EdgeAssetDetails.module.css'
import NumberUnit from '../molecules/NumberUnit'

export default function EdgeAssetDetails({
  ddo
}: {
  ddo: EdgeDDO
}): ReactElement {
  const { model } = ddo.findServiceByType('edge').provider.device
  const { attributes } = ddo.findServiceByType('edge')
  const numberOfAvailableAssets = attributes.main.availableServices.length
  return (
    <div className={styles.container}>
      <NumberUnit label={model} value={numberOfAvailableAssets} />
    </div>
  )
}
