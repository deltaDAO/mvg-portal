import React, { useState, useEffect } from 'react'
import styles from './index.module.css'
import { getAllComputeJobs } from '@utils/compute'
import { useAccount } from 'wagmi'
import { useCancelToken } from '@hooks/useCancelToken'
import Time from '@shared/atoms/Time'
import Details from '@components/Profile/History/ComputeJobs/Details'
import FinishedIcon from '@images/finished.svg'
import InProgress from '@images/InProgress.svg'

const ComputeJobs = () => {
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { address: accountId } = useAccount()
  const newCancelToken = useCancelToken()

  useEffect(() => {
    const fetchComputeJobs = async () => {
      if (!accountId) {
        console.log('No account ID available')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching compute jobs for account:', accountId)

        const response = await getAllComputeJobs(accountId, newCancelToken())

        if (response?.computeJobs) {
          console.log(
            'Successfully fetched compute jobs:',
            JSON.stringify(response.computeJobs, null, 2)
          )
          setJobs(response.computeJobs)
        } else {
          console.warn('No compute jobs found in response')
          setJobs([])
        }
      } catch (err) {
        console.error('Error fetching compute jobs:', err)
        setError('Failed to load compute jobs. Please try again.')
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchComputeJobs()
  }, [accountId, newCancelToken])

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
          console.log('Debug - dateFinishedMs:', dateFinishedMs)

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
    </div>
  )
}

export default ComputeJobs
