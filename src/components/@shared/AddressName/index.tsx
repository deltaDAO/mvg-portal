import { usePontusXRegistry } from '@deltadao/pontusx-registry-hooks'
import { useAddressConfig } from '@hooks/useAddressConfig'
import { accountTruncate } from '@utils/wallet'
import { ReactElement } from 'react'

export default function AddressName({
  address
}: {
  address: string
}): ReactElement {
  const { verifiedAddresses: oldVerifiedAddresses } = useAddressConfig()
  const { data } = usePontusXRegistry({
    apiBaseUrl: 'https://cache.registry.staging.pontus-x.eu'
  })

  const verifiedAddresses = {
    ...oldVerifiedAddresses
  }

  for (const item of data || []) {
    verifiedAddresses[`${item.walletAddress}`] = item.legalName
  }

  return <>{verifiedAddresses?.[address] || accountTruncate(address)}</>
}
