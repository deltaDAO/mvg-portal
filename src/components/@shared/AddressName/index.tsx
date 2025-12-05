import { usePontusXIdentity } from '@deltadao/pontusx-registry-hooks'
import { accountTruncate } from '@utils/wallet'
import { ReactElement } from 'react'
import { useMarketMetadata } from '@context/MarketMetadata'

export default function AddressName({
  address,
  verifiedServiceProviderName
}: {
  address: string
  verifiedServiceProviderName?: string
}): ReactElement {
  const {
    appConfig: { cachingMicroserviceUrl }
  } = useMarketMetadata()
  const identity = usePontusXIdentity(address, {
    includeDeprecated: true,
    apiBaseUrl: cachingMicroserviceUrl
  })
  return (
    <>
      {verifiedServiceProviderName ||
        identity?.legalName ||
        accountTruncate(address)}
    </>
  )
}
