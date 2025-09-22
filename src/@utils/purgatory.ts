import { fetchData } from './fetch'
import { purgatoryUrl } from '../../app.config.cjs'

export interface PurgatoryDataAccount {
  address: string
  reason: string
}

export async function getAccountPurgatoryData(
  address: string
): Promise<PurgatoryDataAccount> {
  if (!purgatoryUrl) return { address: undefined, reason: undefined }

  const data = (await fetchData(
    `${purgatoryUrl}account?address=${address}`
  )) as PurgatoryDataAccount[]
  return { address: data[0]?.address, reason: data[0]?.reason }
}
