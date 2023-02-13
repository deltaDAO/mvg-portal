import { PurgatoryData as PurgatoryDataAsset } from '@oceanprotocol/lib'
import { fetchData } from '.'
import { purgatoryUri } from '../../app.config'

export interface PurgatoryDataAccount {
  address: string
  reason: string
}

export default async function getAssetPurgatoryData(
  did: string
): Promise<PurgatoryDataAsset> {
  if (!purgatoryUri) return { did: undefined, reason: undefined }

  const data = await fetchData(`${purgatoryUri}asset?did=${did}`)
  return { did: data[0]?.did, reason: data[0]?.reason }
}

export async function getAccountPurgatoryData(
  address: string
): Promise<PurgatoryDataAccount> {
  if (!purgatoryUri) return { address: undefined, reason: undefined }

  const data = await fetchData(`${purgatoryUri}account?address=${address}`)
  return { address: data[0]?.address, reason: data[0]?.reason }
}
