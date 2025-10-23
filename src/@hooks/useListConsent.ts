import { useSuspenseQuery } from '@tanstack/react-query'
import { getAsset } from '@utils/aquarius'
import { Consent } from '@utils/consents/types'
import { extractDidFromUrl } from '@utils/consents/utils'
import axios from 'axios'

export function useListConsent(consent: Consent) {
  const datasetQuery = useSuspenseQuery({
    queryKey: ['asset', consent.dataset],
    queryFn: ({ signal }) => {
      const { CancelToken } = axios
      const source = CancelToken.source()

      const promise = getAsset(extractDidFromUrl(consent.dataset), source.token)

      signal?.addEventListener('abort', () => {
        source.cancel('Query was cancelled')
      })

      return promise
    }
  })

  const algorithmQuery = useSuspenseQuery({
    queryKey: ['asset', consent.algorithm],
    queryFn: ({ signal }) => {
      const { CancelToken } = axios
      const source = CancelToken.source()

      const promise = getAsset(
        extractDidFromUrl(consent.algorithm),
        source.token
      )

      signal?.addEventListener('abort', () => {
        source.cancel('Query was cancelled')
      })

      return promise
    }
  })

  return {
    datasetQuery,
    algorithmQuery
  }
}
