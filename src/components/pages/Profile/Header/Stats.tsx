import { Logger } from '@oceanprotocol/lib'
import React, { useEffect, useState } from 'react'
import { ReactElement } from 'react-markdown'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import {
  getAccountLiquidityInOwnAssets,
  getAssetsBestPrices,
  UserLiquidity,
  calculateUserLiquidity
} from '../../../../utils/subgraph'
import Conversion from '../../../atoms/Price/Conversion'
import NumberUnit from '../../../molecules/NumberUnit'
import styles from './Stats.module.css'
import { useProfile } from '../../../../providers/Profile'
import { PoolShares_poolShares as PoolShare } from '../../../../@types/apollo/PoolShares'

async function getPoolSharesLiquidity(
  poolShares: PoolShare[]
): Promise<number> {
  let totalLiquidity = 0

  for (const poolShare of poolShares) {
    const poolLiquidity = calculateUserLiquidity(poolShare)
    totalLiquidity += poolLiquidity
  }

  return totalLiquidity
}

export default function Stats(): ReactElement {
  const { assetsTotal, sales } = useProfile()

  return (
    <div className={styles.stats}>
      <NumberUnit label={`Sale${sales === 1 ? '' : 's'}`} value={sales} />
      <NumberUnit label="Published" value={assetsTotal} />
    </div>
  )
}
