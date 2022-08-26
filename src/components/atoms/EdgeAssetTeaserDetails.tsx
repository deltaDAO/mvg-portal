import React, { ReactElement, useEffect, useState } from 'react'
import { EdgeDDO } from '../../@types/edge/DDO'
import styles from './EdgeAssetTeaserDetails.module.css'
import classNames from 'classnames/bind'
import Badge from './Badge'
import { getAssetsForProviders } from '../../utils/aquarius'
import { useUserPreferences } from '../../providers/UserPreferences'
import { useCancelToken } from '../../hooks/useCancelToken'
import axios from 'axios'

const cx = classNames.bind(styles)

export default function EdgeAssetTeaserDetails({
  ddo
}: {
  ddo: EdgeDDO
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const newCancelToken = useCancelToken()
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(false)
  const [availableAssets, setAvailableAssets] = useState<number>(0)

  const service = ddo.findServiceByType('edge')
  const assetModel = service?.attributes?.main?.provider?.device?.model
  const { serviceEndpoint } = ddo.findServiceByType('edge')

  useEffect(() => {
    if (!ddo || !serviceEndpoint) return
    const checkService = async () => {
      const response = await axios.get(serviceEndpoint)
      if (response.status === 200) {
        setIsDeviceOnline(true)
        return
      }
      setIsDeviceOnline(false)
    }

    const fetchAssets = async () => {
      const assets = await getAssetsForProviders(
        [serviceEndpoint],
        chainIds,
        newCancelToken()
      )
      setAvailableAssets(assets.length)
    }

    checkService()
    fetchAssets()
  }, [chainIds, ddo, newCancelToken, serviceEndpoint])

  const badgeStyles = cx({
    badge: true,
    unavailable: !isDeviceOnline
  })
  return (
    <div className={styles.container}>
      {assetModel && (
        <div className={styles.details}>
          <div>
            <span className={styles.model}>{assetModel}</span>
            <Badge
              label={isDeviceOnline ? 'online' : 'offline'}
              className={badgeStyles}
            />
          </div>
          <span className={styles.availableAssets}>
            {`${availableAssets} available assets`}
          </span>
        </div>
      )}
    </div>
  )
}
