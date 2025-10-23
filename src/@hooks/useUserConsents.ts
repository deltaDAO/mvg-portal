import {
  useMutation,
  useQueryClient,
  useSuspenseQuery
} from '@tanstack/react-query'
import { AssetConsentApplier } from '@utils/assetConsentApplier'
import {
  createConsent,
  createConsentResponse,
  deleteConsent,
  deleteConsentResponse,
  getHealth,
  getUserConsents,
  getUserConsentsDirection
} from '@utils/consents/api'
import {
  Consent,
  ConsentDirection,
  PossibleRequests,
  UserConsentsData
} from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import { useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { useAbortController } from './useAbortController'
import { useAutoSigner } from './useAutoSigner'
import { useCancelToken } from './useCancelToken'
import { useUserConsentsToken } from './useUserConsentsToken'

export const useUserConsentsAmount = () => {
  const { address } = useAccount()
  return useSuspenseQuery({
    queryKey: ['profile-consents', address],
    queryFn: async ({ signal }) => getUserConsents(address, signal)
  })
}

const useUserConsents = (direction: ConsentDirection, queryKey: string) => {
  const { address } = useAccount()
  const queryClient = useQueryClient()
  const query = useSuspenseQuery({
    queryKey: [queryKey, address],
    queryFn: async ({ signal }) =>
      getUserConsentsDirection(address, direction, signal)
  })

  // Check if the fetched data differs from the stored pendings, if so, refetch user stats
  useEffect(() => {
    const amounts = (queryClient.getQueryData(['profile-consents', address]) ??
      {}) as UserConsentsData

    let hasChanged = false

    switch (direction) {
      case 'Incoming':
        hasChanged =
          amounts.incoming_pending_consents !==
          query.data.filter(isPending).length
        break
      case 'Outgoing':
        hasChanged =
          amounts.outgoing_pending_consents !==
          query.data.filter(isPending).length
        break
    }

    if (hasChanged) {
      queryClient.invalidateQueries({
        queryKey: ['profile-consents', address]
      })
    }
  }, [address, direction, query.data, queryClient])

  return query
}

export const useUserIncomingConsents = () => {
  return useUserConsents('Incoming', 'user-incoming-consents')
}

export const useUserOutgoingConsents = () => {
  return useUserConsents('Outgoing', 'user-outgoing-consents')
}

export const useDeleteConsentResponse = () => {
  const queryClient = useQueryClient()
  const { accountId: address } = useAutoSigner()
  useUserConsentsToken()

  interface Mutation {
    consentId: number
  }

  return useMutation({
    mutationFn: async ({ consentId }: Mutation) =>
      deleteConsentResponse(consentId),

    onSuccess: (_data, { consentId }) => {
      // Set the consent back to "no-response" state
      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[] = []) => {
          return oldData.map((consent) => {
            if (consent.id !== consentId) return consent

            return {
              ...consent,
              status: 'Pending',
              response: null
            }
          })
        }
      )

      // Increase the amount of pending consents
      queryClient.setQueryData(
        ['profile-consents', address],
        (oldData: UserConsentsData) => ({
          ...oldData,
          incoming_pending_consents: oldData.incoming_pending_consents + 1
        })
      )
    }
  })
}

export const useCreateConsentResponse = (asset: AssetExtended) => {
  const { mutateAsync: deleteConsentResponse } = useDeleteConsentResponse()
  const { signer } = useAutoSigner()
  const queryClient = useQueryClient()

  const newCancelToken = useCancelToken()
  const newAbortSignal = useAbortController()
  useUserConsentsToken()

  const revertCallback = useCallback(
    async (consentId: number, error?: unknown) => {
      if (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : String(error))
      }

      await deleteConsentResponse({ consentId })
      toast.warn('Failed transaction, reverted consent response.')
    },
    [deleteConsentResponse]
  )

  return useMutation({
    mutationFn: ({
      consentId,
      reason,
      permitted
    }: {
      consentId: number
      reason: string
      permitted: PossibleRequests
    }) => createConsentResponse(consentId, reason, permitted),
    onSuccess: async (newConsent, { consentId, reason, permitted }) => {
      const address = await signer.getAddress()

      // 1. Update the list of incoming consents
      queryClient.setQueryData(
        ['user-incoming-consents', address],
        (oldData: Consent[] = []) => {
          return oldData.map((consent) => {
            if (consent.id !== consentId) return consent

            return {
              ...consent,
              status: newConsent.status,
              response: {
                consent: newConsent.url,
                status: newConsent.status,
                reason,
                permitted,
                last_updated_at: 0
              }
            }
          })
        }
      )

      // 2. Decrease the amount of pending consents
      queryClient.setQueryData(
        ['profile-consents', address],
        (oldData: UserConsentsData) => ({
          ...oldData,
          incoming_pending_consents: oldData.incoming_pending_consents - 1
        })
      )

      await AssetConsentApplier(
        newConsent,
        signer,
        newCancelToken,
        newAbortSignal
      )
        .apply(asset)
        .catch(async (error) => {
          await revertCallback(consentId)
          console.error(error)
        })
    }
  })
}

export const useCreateAssetConsent = () => {
  const { accountId: address } = useAutoSigner()
  useUserConsentsToken()

  interface Mutation {
    chainId: number
    datasetDid: string
    algorithmDid: string
    request: PossibleRequests
    reason?: string
  }

  return useMutation({
    mutationFn: async ({
      chainId,
      datasetDid,
      algorithmDid,
      request,
      reason
    }: Mutation) =>
      createConsent(address, chainId, datasetDid, algorithmDid, request, reason)
  })
}

export const useDeleteConsent = () => {
  const queryClient = useQueryClient()
  const { accountId: address } = useAutoSigner()
  useUserConsentsToken()

  interface Mutation {
    consent: Consent
  }

  return useMutation({
    mutationFn: async ({ consent }: Mutation) => deleteConsent(consent.id),

    onSuccess: async (_, { consent }) => {
      if (!address) return

      const direction = `user-${consent.direction.toLowerCase()}-consents`
      queryClient.setQueryData(
        [direction, address],
        (oldData: Consent[] = []) => oldData.filter((c) => c.id !== consent.id)
      )

      if (isPending(consent)) {
        // Decrease the amount of pending consents
        queryClient.setQueryData(
          ['profile-consents', address],
          (oldData: UserConsentsData) => ({
            ...oldData,
            outgoing_pending_consents: oldData.outgoing_pending_consents - 1
          })
        )
      }
    }
  })
}

export const useHealthcheck = () =>
  useSuspenseQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    staleTime: 0
  })
