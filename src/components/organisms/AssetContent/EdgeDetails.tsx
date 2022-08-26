import React, { ReactElement } from 'react'
import { EdgeDDO } from '../../../@types/edge/DDO'
import { useAsset } from '../../../providers/Asset'
import classNames from 'classnames/bind'
import styles from './EdgeDetails.module.css'
import Badge from '../../atoms/Badge'
import MetaItem from './MetaItem'

const cx = classNames.bind(styles)

export default function EdgeDetails({ ddo }: { ddo: EdgeDDO }): ReactElement {
  const { isEdgeCtdAvailable } = useAsset()
  const { attributes, serviceEndpoint } = ddo.findServiceByType('edge')
  const { model, serialNumber } = attributes.main.provider.device

  const badgeStyles = cx({
    badge: true,
    unavailable: !isEdgeCtdAvailable
  })
  return (
    <div>
      <div className={styles.info}>
        <MetaItem title="Model name" content={<h5>{model}</h5>} />
        <MetaItem title="Serial number" content={<h5>{serialNumber}</h5>} />
      </div>
      <div className={styles.status}>
        <Badge
          label={isEdgeCtdAvailable ? 'online' : 'offline'}
          className={badgeStyles}
          large
        />
        <p>{serviceEndpoint || ''}</p>
      </div>
    </div>
  )
}
