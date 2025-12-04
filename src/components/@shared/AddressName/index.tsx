import { usePontusXRegistry } from '@deltadao/pontusx-registry-hooks'
import { useAddressConfig } from '@hooks/useAddressConfig'
import { accountTruncate } from '@utils/wallet'
import { cachingMicroserviceUrl } from 'app.config'
import { ReactElement } from 'react'

export default function AddressName({
  address
}: {
  address: string
}): ReactElement {
  const { verifiedAddresses: oldVerifiedAddresses } = useAddressConfig()
  const { data } = usePontusXRegistry(
    cachingMicroserviceUrl
      ? {
          apiBaseUrl: cachingMicroserviceUrl
        }
      : undefined
  )

  const verifiedAddresses = {
    ...oldVerifiedAddresses
  }

  for (const item of data || []) {
    verifiedAddresses[`${item.walletAddress}`] = item.legalName
  }

  return <>{verifiedAddresses?.[address] || accountTruncate(address)}</>
}
