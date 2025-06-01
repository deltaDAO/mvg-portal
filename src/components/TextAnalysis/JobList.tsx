import { LoggerInstance, ProviderInstance } from '@oceanprotocol/lib'
import {
  MutableRefObject,
  ReactElement,
  useCallback,
  useEffect,
  useState
} from 'react'
import { toast } from 'react-toastify'
import { useAccount, useSigner } from 'wagmi'
import { useAutomation } from '../../@context/Automation/AutomationProvider'
import { useUseCases } from '../../@context/UseCases'
import { TextAnalysisUseCaseData } from '../../@context/UseCases/models/TextAnalysis.model'
import { useUserPreferences } from '../../@context/UserPreferences'
import { useCancelToken } from '../../@hooks/useCancelToken'
import { getAsset } from '../../@utils/aquarius'
import { getComputeJobs } from '../../@utils/compute'
import Accordion from '../@shared/Accordion'
import Button from '../@shared/atoms/Button'
import ComputeJobs, { GetCustomActions } from '../Profile/History/ComputeJobs'
import styles from './JobList.module.css'
import { TEXT_ANALYSIS_ALGO_DIDS, TEXT_ANALYSIS_RESULT_ZIP } from './_constants'
// import {
//   getMapColor,
//   getResultBinaryData,
//   transformBinaryToRoadDamageResult
// } from './_utils'

import { TextAnalysisResult } from './_types'

export default function JobList(): ReactElement {
  const { chainIds } = useUserPreferences()
  const textAnalysisAlgoDids: string[] = Object.values(TEXT_ANALYSIS_ALGO_DIDS)

  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet } = useAutomation()

  const { fileName: resultFileName } = TEXT_ANALYSIS_RESULT_ZIP

  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  // TESTLOG
  console.log('JobList component rendering')

  const {
    textAnalysisList,
    clearTextAnalysis,
    createOrUpdateTextAnalysis,
    deleteTextAnalysis
  } = useUseCases()

  // TESTLOG
  console.log('useUseCases hook result:', {
    hasTextAnalysisList: !!textAnalysisList,
    textAnalysisListLength: textAnalysisList?.length
  })

  // useEffect(() => {
  //   if (!roadDamageList) {
  //     setMapData([])
  //     return
  //   }

  //   setMapData(roadDamageList)
  // }, [roadDamageList, setMapData])

  const fetchJobs = useCallback(async () => {
    if (!accountId) {
      // TESTLOG
      console.log('No account ID found')

      return
    }

    try {
      setIsLoadingJobs(true)
      // Fetch computeJobs for all selected networks (UserPreferences)
      const computeJobs = await getComputeJobs(
        chainIds,
        accountId,
        null,
        newCancelToken()
      )
      if (autoWallet) {
        const autoComputeJobs = await getComputeJobs(
          chainIds,
          autoWallet?.address,
          null,
          newCancelToken()
        )
        autoComputeJobs.computeJobs.forEach((job) => {
          computeJobs.computeJobs.push(job)
        })
      }

      setJobs(
        // Filter computeJobs for dids configured in _constants
        computeJobs.computeJobs.filter(
          (job) =>
            textAnalysisAlgoDids.includes(job.algoDID) && job.status === 70

          // TODO: Uncomment this when the resultFileName is available
          // job.results.filter((result) => result.filename === resultFileName)
          // .length > 0
        )
      )
      setIsLoadingJobs(!computeJobs.isLoaded)
    } catch (error) {
      LoggerInstance.error(error.message)
      setIsLoadingJobs(false)
    }
  }, [
    chainIds,
    textAnalysisAlgoDids,
    accountId,
    autoWallet,
    resultFileName,
    newCancelToken
  ])

  useEffect(() => {
    fetchJobs()
  }, [refetchJobs, chainIds])

  const addComputeResultToUseCaseDB = async (job: ComputeJobMetaData) => {
    // TESTLOG
    console.log('Adding compute result to DB:', job)

    if (textAnalysisList.find((row) => row.job.jobId === job.jobId)) {
      toast.info('This compute job result already is part of the map view.')
      return
    }

    const dataForSameInputExists =
      textAnalysisList.filter(
        (row) =>
          job.inputDID?.filter((did) => row.job.inputDID?.includes(did))
            .length === job.inputDID?.length
      ).length > 0

    if (dataForSameInputExists)
      if (
        !confirm(
          'Compute job results for a job with the same dataset inputs already exists. Add anyways?'
        )
      )
        return

    try {
      const datasetDDO = await getAsset(job.inputDID[0], newCancelToken())

      const signerToUse =
        job.owner.toLowerCase() === autoWallet?.address.toLowerCase()
          ? autoWallet
          : signer

      const jobResult = await ProviderInstance.getComputeResultUrl(
        datasetDDO.services[0].serviceEndpoint,
        signerToUse,
        job.jobId,
        job.results.findIndex((result) => result.filename === resultFileName)
      )

      const resultData = JSON.parse(jobResult) as TextAnalysisResult[]

      if (!resultData) return

      const newuseCaseData: TextAnalysisUseCaseData = {
        job,
        result: resultData
      }

      await createOrUpdateTextAnalysis(newuseCaseData)
      toast.success('Added a new compute result')
    } catch (error) {
      LoggerInstance.error(error)
      toast.error('Could not add compute result')
    }
  }

  const deleteJobResultFromDB = async (job: ComputeJobMetaData) => {
    if (!confirm(`Are you sure you want to delete the result from map view?`))
      return

    const rowToDelete = textAnalysisList.find(
      (row) => row.job.jobId === job.jobId
    )
    if (!rowToDelete) return

    await deleteTextAnalysis(rowToDelete.id)
    toast.success(`Removed compute job result from visualization.`)
  }

  const clearData = async () => {
    if (!confirm('All data will be removed from your cache. Proceed?')) return

    await clearTextAnalysis()
    toast.success('Text Analysis data was cleared.')
  }

  const getCustomActionsPerComputeJob: GetCustomActions = (
    job: ComputeJobMetaData
  ) => {
    const addAction = {
      label: 'Add',
      onClick: () => {
        addComputeResultToUseCaseDB(job)
      }
    }
    const deleteAction = {
      label: 'Remove',
      onClick: () => {
        deleteJobResultFromDB(job)
      }
    }
    // const colorLegend = {
    //   label: (
    //     <span
    //       className={styles.legend}
    //       style={{ backgroundColor: getMapColor(job.inputDID) }}
    //     />
    //   ),
    //   onClick: () => {
    //     if (scrollToMapRef?.current) scrollToMapRef.current.scrollIntoView()
    //   }
    // }

    const viewContainsResult = textAnalysisList.find(
      (row) => row.job.jobId === job.jobId
    )

    const actionArray = []

    if (viewContainsResult) {
      actionArray.push(deleteAction)
      // actionArray.push(colorLegend)
    } else actionArray.push(addAction)

    return actionArray
  }

  return (
    <div className={styles.accordionWrapper}>
      <Accordion title="Compute Jobs" defaultExpanded>
        <ComputeJobs
          jobs={jobs}
          isLoading={isLoadingJobs}
          refetchJobs={() => setRefetchJobs(!refetchJobs)}
          getActions={getCustomActionsPerComputeJob}
          hideDetails
        />

        <div className={styles.actions}>
          <Button onClick={() => clearData()}>Clear Data</Button>
        </div>
      </Accordion>
    </div>
  )
}
