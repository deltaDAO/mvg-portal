import React, { ReactElement } from 'react'
import styles from './AssetType.module.css'
import classNames from 'classnames/bind'
import { ReactComponent as Compute } from '../../images/compute.svg'
import { ReactComponent as Download } from '../../images/download.svg'
import {
  ReactComponent as Lock,
  ReactComponent as Edge
} from '../../images/edgeAssetIcon.svg'

import { MetadataMainMarket } from '../../@types/MetaData'

const cx = classNames.bind(styles)

const assetTypeLabels: { [value in MetadataMainMarket['type']]: string } = {
  dataset: 'data set',
  algorithm: 'algorithm',
  edge: 'edge'
}

export default function AssetType({
  type,
  accessType,
  className
}: {
  type: MetadataMainMarket['type']
  accessType: string
  className?: string
}): ReactElement {
  const styleClasses = cx({
    [className]: className
  })
  return (
    <div className={styleClasses}>
      {type === 'edge' ? (
        <Edge role="img" aria-label="Download" className={styles.icon} />
      ) : accessType === 'access' ? (
        <Download role="img" aria-label="Download" className={styles.icon} />
      ) : accessType === 'compute' && type === 'algorithm' ? (
        <Lock role="img" aria-label="Private" className={styles.icon} />
      ) : (
        <Compute role="img" aria-label="Compute" className={styles.icon} />
      )}

      <div className={styles.typeLabel}>{assetTypeLabels[type]}</div>
    </div>
  )
}
