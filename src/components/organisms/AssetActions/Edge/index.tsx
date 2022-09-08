import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { EdgeDDO } from '../../../../@types/edge/DDO'
import { useCancelToken } from '../../../../hooks/useCancelToken'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import {
  getAssetsForProviders,
  transformDDOToAssetSelection
} from '../../../../utils/aquarius'
import InputElement from '../../../atoms/Input/InputElement'
import AssetComputeList from '../../../molecules/AssetComputeList'
import { AssetSelectionAsset } from '../../../molecules/FormFields/AssetSelection'
import Details from './Details'
import styles from './index.module.css'

export default function Edge({ ddo }: { ddo: EdgeDDO }): ReactElement {
  const { chainIds } = useUserPreferences()
  const newCancelToken = useCancelToken()

  const edgeService = ddo.findServiceByType('edge')
  const [datasetsForCompute, setDatasetsForCompute] =
    useState<AssetSelectionAsset[]>()
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    if (!ddo || !edgeService?.serviceEndpoint) return
    const fetchAssets = async () => {
      const assets = await getAssetsForProviders(
        [edgeService.serviceEndpoint],
        chainIds,
        newCancelToken()
      )
      const assetSelection = await transformDDOToAssetSelection(
        undefined,
        assets,
        [],
        newCancelToken()
      )
      setDatasetsForCompute(assetSelection)
    }

    fetchAssets()
  }, [chainIds, ddo, newCancelToken, edgeService])

  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
  }

  return (
    <div className={styles.datasetsContainer}>
      <Details ddo={ddo} />
      <div className={styles.textContainer}>
        <h3 className={styles.text}>Assets on this device</h3>
      </div>
      <div className={styles.searchContainer}>
        <InputElement
          type="search"
          name="search"
          size="small"
          placeholder="Search by title, datatoken, or DID..."
          value={searchValue}
          onChange={handleSearchInput}
          className={styles.search}
        />
      </div>
      <AssetComputeList
        assets={datasetsForCompute?.filter((asset: AssetSelectionAsset) =>
          searchValue !== ''
            ? asset.name.toLowerCase().includes(searchValue.toLowerCase()) ||
              asset.did.toLowerCase().includes(searchValue.toLowerCase()) ||
              asset.symbol.toLowerCase().includes(searchValue.toLowerCase())
            : asset
        )}
      />
    </div>
  )
}
