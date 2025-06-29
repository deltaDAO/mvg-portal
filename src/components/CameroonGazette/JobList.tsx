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
import {
  CAMEROON_GAZETTE_ALGO_DIDS,
  CAMEROON_GAZETTE_RESULT_ZIP
} from './_constants'
import { TextAnalysisResult } from './_types'

export default function JobList(props: {
  setTextAnalysisData: (textAnalysisData: TextAnalysisUseCaseData[]) => void
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const cameroonGazetteAlgoDids: string[] = Object.values(
    CAMEROON_GAZETTE_ALGO_DIDS
  )

  const { address: accountId } = useAccount()
  const { data: signer } = useSigner()
  const { autoWallet } = useAutomation()

  // const { fileName: resultFileName } = TEXT_ANALYSIS_RESULT_ZIP

  const [jobs, setJobs] = useState<ComputeJobMetaData[]>([])
  const [refetchJobs, setRefetchJobs] = useState(false)
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const newCancelToken = useCancelToken()

  const { setTextAnalysisData } = props

  const {
    textAnalysisList,
    clearTextAnalysis,
    createOrUpdateTextAnalysis,
    deleteTextAnalysis
  } = useUseCases()

  useEffect(() => {
    if (!textAnalysisList) {
      setTextAnalysisData([])
      return
    }

    setTextAnalysisData(textAnalysisList)
  }, [textAnalysisList, setTextAnalysisData])

  const fetchJobs = useCallback(async () => {
    if (!accountId) {
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
            cameroonGazetteAlgoDids.includes(job.algoDID) && job.status === 70

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
    cameroonGazetteAlgoDids,
    accountId,
    autoWallet,
    // resultFileName,
    newCancelToken
  ])

  useEffect(() => {
    fetchJobs()
  }, [refetchJobs, chainIds])

  const addComputeResultToUseCaseDB = async (job: ComputeJobMetaData) => {
    if (textAnalysisList.find((row) => row.job.jobId === job.jobId)) {
      toast.info('This compute job result already is part of the map view.')
      return
    }

    try {
      const datasetDDO = await getAsset(job.inputDID[0], newCancelToken())
      const signerToUse =
        job.owner.toLowerCase() === autoWallet?.address.toLowerCase()
          ? autoWallet
          : signer

      const resultFiles = job.results.slice(0, 5)
      const results = []

      for (let i = 0; i < resultFiles.length; i++) {
        const url = await ProviderInstance.getComputeResultUrl(
          datasetDDO.services[0].serviceEndpoint,
          signerToUse,
          job.jobId,
          i
        )

        const response = await fetch(url)
        const content = await response.text()

        results.push({
          filename: resultFiles[i].filename,
          url,
          content
        })

        // add time delay to avoid nonce collision
        if (i < resultFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200)) // time delay
        }
      }

      const textAnalysisResults: TextAnalysisResult[] = results.map((file) => {
        const { filename, content: fileContent } = file
        const filenameLower = filename.toLowerCase()
        let content = fileContent

        if (filenameLower.endsWith('.json')) {
          try {
            content = JSON.parse(fileContent)
          } catch (error) {
            console.error('Error parsing JSON content:', error)
            return {}
          }
        }

        const result: TextAnalysisResult = {}

        if (
          filenameLower.includes('wordcloud') ||
          filenameLower.includes('word_cloud')
        ) {
          result.wordcloud = content
        } else if (filenameLower.includes('sentiment')) {
          // Handle sentiment data
          try {
            let parsedContent
            if (typeof content === 'string') {
              parsedContent = JSON.parse(content)
            } else if (typeof content === 'object' && content !== null) {
              parsedContent = content
            } else {
              console.warn('Invalid sentiment content type:', typeof content)
              return result
            }

            // Validate the structure
            if (!Array.isArray(parsedContent)) {
              console.warn(
                'Sentiment data should be an array of sentiment categories'
              )
              return result
            }

            // Validate each sentiment category
            const validSentimentData = parsedContent.every((category) => {
              return (
                typeof category === 'object' &&
                category !== null &&
                typeof category.name === 'string' &&
                Array.isArray(category.values) &&
                category.values.every(
                  (value) =>
                    Array.isArray(value) &&
                    value.length === 2 &&
                    typeof value[0] === 'string' &&
                    typeof value[1] === 'number' &&
                    !isNaN(value[1])
                )
              )
            })

            if (!validSentimentData) {
              console.warn('Invalid sentiment data structure:', parsedContent)
              return result
            }

            result.sentiment = parsedContent
          } catch (error) {
            console.error('Error processing sentiment data:', error)
            return result
          }
        } else if (filenameLower.includes('date_distribution')) {
          result.dataDistribution = content
        } else if (filenameLower.includes('email_distribution')) {
          result.emailDistribution = content
        } else if (filenameLower.includes('document_summary')) {
          result.documentSummary = content
        }

        return result
      })

      const newuseCaseData: TextAnalysisUseCaseData = {
        job,
        result: textAnalysisResults
      }

      await createOrUpdateTextAnalysis(newuseCaseData)
      toast.success('Added a new compute result')
    } catch (error) {
      LoggerInstance.error(error)
      toast.error('Could not add compute result')
    }
  }

  const deleteJobResultFromDB = async (job: ComputeJobMetaData) => {
    if (
      !confirm(`Are you sure you want to delete the result from visualization?`)
    )
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
