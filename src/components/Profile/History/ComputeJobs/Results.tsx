import {
  ComputeResultType,
  downloadFileBrowser,
  getErrorMessage,
  LoggerInstance,
  Provider
} from '@oceanprotocol/lib'
import React, { ReactElement, useEffect, useState } from 'react'
import { ListItem } from '@shared/atoms/Lists'
import Button from '@shared/atoms/Button'
import styles from './Results.module.css'
import FormHelp from '@shared/FormInput/Help'
import content from '../../../../../content/pages/history.json'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { useAccount, useSigner } from 'wagmi'
import { toast } from 'react-toastify'
import { prettySize } from '@components/@shared/FormInput/InputElement/FilesInput/utils'
import { useAutomation } from '../../../../@context/Automation/AutomationProvider'

export default function Results({
  job
}: {
  job: ComputeJobMetaData
}): ReactElement {
  const providerInstance = new Provider()
  const { address: accountId } = useAccount()
  const { autoWallet } = useAutomation()
  const { data: signer } = useSigner()

  const [datasetProvider, setDatasetProvider] = useState<string>()
  const newCancelToken = useCancelToken()

  const isFinished = job.dateFinished !== null

  useEffect(() => {
    async function getAssetMetadata() {
      const ddo = await getAsset(job.inputDID[0], newCancelToken())
      setDatasetProvider(ddo.services[0].serviceEndpoint)
    }
    getAssetMetadata()
  }, [job.inputDID, newCancelToken])

  function getDownloadButtonValue(
    type: ComputeResultType,
    name: string
  ): string {
    let buttonName
    switch (type) {
      case 'output':
        buttonName = `RESULTS (${name})`
        break
      case 'algorithmLog':
        buttonName = 'ALGORITHM LOGS'
        break
      case 'configrationLog':
        buttonName = 'CONFIGURATION LOGS'
        break
      case 'publishLog':
        buttonName = 'PUBLISH LOGS'
        break
      default:
        buttonName = `RESULTS (${name})`
        break
    }
    return buttonName
  }

  async function downloadResults(resultIndex: number) {
    if (!accountId || !job) return

    const signerToUse =
      job.owner.toLowerCase() === autoWallet?.address.toLowerCase()
        ? autoWallet
        : signer

    try {
      const jobResult = await providerInstance.getComputeResultUrl(
        datasetProvider,
        signerToUse,
        job.jobId,
        resultIndex
      )
      await downloadFileBrowser(jobResult)
    } catch (error) {
      const message = getErrorMessage(JSON.parse(error.message))
      LoggerInstance.error('[Provider Get c2d results url] Error:', message)
      toast.error(message)
    }
  }

  return (
    <div className={styles.results}>
      <h4 className={styles.title}>Results</h4>
      {isFinished ? (
        <ul>
          {job.results &&
            Array.isArray(job.results) &&
            job.results.map((jobResult, i) =>
              jobResult.filename ? (
                <ListItem key={i}>
                  <Button
                    style="text"
                    size="small"
                    className={styles.downloadButton}
                    onClick={() => {
                      downloadResults(i)
                    }}
                    download
                  >
                    {`${getDownloadButtonValue(
                      jobResult.type,
                      jobResult.filename
                    )} - ${prettySize(jobResult.filesize)}`}
                  </Button>
                </ListItem>
              ) : (
                <ListItem key={i}>No results found.</ListItem>
              )
            )}
        </ul>
      ) : (
        <p> Waiting for results...</p>
      )}
      <FormHelp className={styles.help}>{content.compute.storage}</FormHelp>
    </div>
  )
}
