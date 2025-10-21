import { verifyRawServiceCredential } from '@components/Publish/_utils'
import { useQuery } from '@tanstack/react-query'
import { GaiaXVerifiablePresentation } from '@utils/verifiablePresentations/types'
import { Address } from 'wagmi'

export const useVerifiablePresentationVerification = (
  presentation: GaiaXVerifiablePresentation,
  address: Address,
  index: number
) =>
  useQuery({
    queryKey: ['verifiable-presentation-gxdch', address, index],
    queryFn: async () =>
      verifyRawServiceCredential(JSON.stringify(presentation, null, 2)),
    enabled: !!presentation
  })
