import { useSuspenseQuery } from '@tanstack/react-query'
import { getVerifiablePresentations } from '@utils/verifiablePresentations/api'
import { Address } from 'wagmi'

export const useVerifiablePresentations = (address: Address) => {
  const { data, error } = useSuspenseQuery({
    queryKey: ['address-credentials', address],
    queryFn: async ({ signal }) => getVerifiablePresentations(address, signal)
  })

  return {
    data,
    error
  }
}
