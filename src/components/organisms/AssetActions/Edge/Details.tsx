import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../../../@types/edge/DDO'
import { useAsset } from '../../../../providers/Asset'
import classNames from 'classnames/bind'
import styles from './Details.module.css'
import Badge from '../../../atoms/Badge'
import MetaItem from '../../AssetContent/MetaItem'
import { ReactComponent as Edge } from '../../../../images/edgeAssetIcon.svg'

const cx = classNames.bind(styles)

export default function Details({ ddo }: { ddo: EdgeDDO }): ReactElement {
  const { isEdgeDeviceAvailable } = useAsset()
  const { attributes } = ddo.findServiceByType('edge')
  const { model, serialNumber } = attributes.main.provider.device

  const badgeStyles = cx({
    badge: true,
    unavailable: !isEdgeDeviceAvailable
  })

  return (
    <div className={styles.detailsContainer}>
      <div className={styles.details}>
        <MetaItem title="Model name" content={<h5>{model}</h5>} />
        <MetaItem title="Serial number" content={<h5>{serialNumber}</h5>} />
      </div>
      <div className={styles.status}>
        <Edge />
        <Badge
          label={isEdgeDeviceAvailable ? 'online' : 'offline'}
          className={badgeStyles}
          large
        />
      </div>
    </div>
  )
}
