import { AssetExtended } from 'src/@types/AssetExtended'
import { Service } from 'src/@types/ddo/Service'

export function getSvcIndex(service: Service, algo: AssetExtended) {
  const trusted = service.compute?.publisherTrustedAlgorithms.find(
    (t) => t.did === algo?.id
  )
  let svcIndex = 0
  if (trusted) {
    const { serviceId } = trusted

    svcIndex = algo.credentialSubject.services.findIndex(
      (s) => s.id === serviceId
    )
  }
  return svcIndex
}
