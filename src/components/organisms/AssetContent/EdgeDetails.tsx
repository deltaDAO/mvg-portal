import React, { ReactElement, useEffect, useState } from 'react'
import { EdgeDDO } from '../../../@types/edge/DDO'
import { useAsset } from '../../../providers/Asset'
import classNames from 'classnames/bind'
import styles from './EdgeDetails.module.css'
import Badge from '../../atoms/Badge'
import MetaItem from './MetaItem'
import { getAssetsForProviders } from '../../../utils/aquarius'
import { useUserPreferences } from '../../../providers/UserPreferences'
import { useCancelToken } from '../../../hooks/useCancelToken'
import AssetListTitle from '../../molecules/AssetListTitle'
import Table from '../../atoms/Table'
import { DDO } from '@oceanprotocol/lib'
import { accountTruncate } from '../../../utils/web3'

const cx = classNames.bind(styles)

export default function EdgeDetails({ ddo }: { ddo: EdgeDDO }): ReactElement {
  const { isEdgeCtdAvailable } = useAsset()
  const { chainIds } = useUserPreferences()
  const newCancelToken = useCancelToken()

  const { attributes, serviceEndpoint } = ddo.findServiceByType('edge')
  const { model, serialNumber } = attributes.main.provider.device

  const [availableAssets, setAvailableAssets] = useState([])
  const [isLoading, setIsLoading] = useState<boolean>()

  useEffect(() => {
    if (!ddo || !serviceEndpoint) return
    const fetchAssets = async () => {
      setIsLoading(true)
      const assets = await getAssetsForProviders(
        [serviceEndpoint],
        chainIds,
        newCancelToken()
      )
      setAvailableAssets(assets)
      setIsLoading(false)
    }

    fetchAssets()
  }, [chainIds, ddo, newCancelToken, serviceEndpoint])

  const badgeStyles = cx({
    badge: true,
    unavailable: !isEdgeCtdAvailable
  })

  const columns = [
    {
      name: 'Asset',
      selector: function getAssetRow(row: DDO) {
        const { attributes } = row.findServiceByType('metadata')
        return <AssetListTitle title={attributes.main.name} ddo={row} />
      },
      maxWidth: '20rem',
      grow: 1
    },
    {
      name: 'DID',
      selector: function getAssetRow(row: DDO) {
        return <p>{accountTruncate(row.id)}</p>
      }
    }
  ]
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
      <div className={styles.assets}>
        <MetaItem
          title="Assets on this device"
          content={
            <Table
              columns={columns}
              data={availableAssets}
              isLoading={isLoading}
              emptyMessage="No available assets on this device."
              noTableHead
            />
          }
        />
      </div>
    </div>
  )
}
