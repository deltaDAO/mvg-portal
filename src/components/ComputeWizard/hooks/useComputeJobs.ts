import { useCallback, useEffect, useState } from 'react'
import { getComputeJobs } from '@utils/compute'
import { Asset } from 'src/@types/Asset'
import { Service } from 'src/@types/ddo/Service'
import { AssetExtended } from 'src/@types/AssetExtended'
import { CancelToken } from 'axios'

interface UseComputeJobsParams {
  asset: AssetExtended
  service: Service
  accountId?: string
  ownerAddress?: string
  chainIds?: number[]
  refreshIntervalMs?: number
  cancelTokenFactory: () => CancelToken
}

export function useComputeJobs({
  asset,
  service,
  accountId,
  ownerAddress,
  chainIds,
  refreshIntervalMs = 10000,
  cancelTokenFactory
}: UseComputeJobsParams) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [computeJobsError, setComputeJobsError] = useState<string>()

  const fetchJobs = useCallback(
    async (type: 'init' | 'poll' = 'poll') => {
      if (!chainIds || chainIds.length === 0 || !ownerAddress) return
      try {
        if (type === 'init') {
          setIsLoadingJobs(true)
        }
        const result = await getComputeJobs(
          asset.credentialSubject?.chainId !== undefined
            ? [asset.credentialSubject.chainId]
            : chainIds,
          ownerAddress,
          asset as unknown as Asset,
          service,
          cancelTokenFactory()
        )

        setJobs(result.computeJobs)
        setIsLoadingJobs(!result.isLoaded)
      } catch (error) {
        const message =
          (error as Error)?.message || 'Failed to fetch compute jobs'
        setComputeJobsError(message)
        if (type === 'init') {
          setIsLoadingJobs(false)
        }
      }
    },
    [asset, service, chainIds, ownerAddress, cancelTokenFactory]
  )

  useEffect(() => {
    fetchJobs('init')

    const interval = setInterval(() => {
      fetchJobs('poll')
    }, refreshIntervalMs)

    return () => clearInterval(interval)
  }, [fetchJobs, refreshIntervalMs])

  return {
    jobs,
    isLoadingJobs,
    computeJobsError,
    refetchJobs: fetchJobs
  }
}
