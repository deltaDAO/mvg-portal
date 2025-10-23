import { useState, useEffect } from 'react'
import styles from './index.module.css'
import { getAllComputeJobs } from '@utils/compute'
import { useAccount } from 'wagmi'
import { useCancelToken } from '@hooks/useCancelToken'
import Time from '@shared/atoms/Time'
import Details from '@components/Profile/History/ComputeJobs/Details'
import FinishedIcon from '@images/finished.svg'
import InProgress from '@images/inProgress.svg'
import { AssetExtended } from 'src/@types/AssetExtended'

const ComputeJobs = ({
  asset,
  refetchTrigger
}: {
  asset?: AssetExtended
  refetchTrigger?: number
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const fetchComputeJobs = async (type: string = 'init') => {
      if (!accountId) {
        console.log('No account ID available')
        setIsLoading(false)
        return
      }

      try {
        if (type === 'init') {
          setIsLoading(true)
        }
        setError(null)
        const response = await getAllComputeJobs(accountId, newCancelToken())

        if (response?.computeJobs) {
          const allJobs = response.computeJobs

          const matchingJobs = Object.entries(allJobs)
            .filter(([jobId, job]: [string, ComputeJobMetaData]) => {
              if (!job.assets || !Array.isArray(job.assets)) {
                console.warn(`Job ${jobId} has no assets array.`)
                return false
              }

              const hasMatch = job.assets.some(
                (assetObj: { documentId: string }) => {
                  return assetObj.documentId === asset?.id
                }
              )

              const hasAlgorithmMatch =
                job.algorithm && job.algorithm.documentId === asset?.id

              return hasMatch || hasAlgorithmMatch
            })
            .map(([, job]) => job)

          setJobs(matchingJobs)
        } else {
          console.warn('No compute jobs found in response')
          setJobs([])
        }
      } catch (err) {
        console.error('Error fetching compute jobs:', err)
        setError('Failed to load compute jobs. Please try again.')
        setJobs([])
      } finally {
        if (type === 'init') {
          setIsLoading(false)
        }
      }
    }

    fetchComputeJobs('init')

    const refreshInterval = 10000
    const interval = setInterval(() => {
      fetchComputeJobs('poll')
    }, refreshInterval)

    return () => {
      clearInterval(interval)
    }
  }, [accountId, newCancelToken, refetchTrigger, asset?.id])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Your Compute Jobs</h1>
        <div className={styles.loading}>Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Your Compute Jobs</h1>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Your Compute Jobs</h1>
        <div className={styles.empty}>No compute jobs found</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Your Compute Jobs</h1>
      <div className={styles.jobsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.statusColumn}>STATUS</div>
          <div className={styles.actionsColumn}>ACTIONS</div>
          <div className={styles.finishedColumn}>FINISHED</div>
        </div>
        {jobs.map((job) => {
          const dateFinishedMs = job.dateFinished
            ? Number(job.dateFinished) * 1000
            : null

          return (
            <div key={job.jobId} className={styles.jobRow}>
              <div className={styles.statusCell}>
                <div className={styles.statusContent}>
                  {dateFinishedMs ? (
                    <FinishedIcon className={styles.statusIcon} />
                  ) : (
                    <InProgress className={styles.statusIcon} />
                  )}
                  <div className={styles.statusText}>{job.statusText}</div>
                </div>
              </div>
              <div className={styles.actionsCell}>
                <Details job={job} />
              </div>
              <div className={styles.finishedCell}>
                {dateFinishedMs ? (
                  <Time date={dateFinishedMs.toString()} isUnix relative />
                ) : (
                  'In progress'
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* <div className={styles.sales}>
        {sales} <span className={styles.salesTag}>Sales</span>
      </div> */}
    </div>
  )
}

export default ComputeJobs
