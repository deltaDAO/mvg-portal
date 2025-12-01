import {
  ComputeResultType,
  downloadFileBrowser,
  getErrorMessage,
  LoggerInstance,
  Provider
} from '@oceanprotocol/lib'
import { ReactElement, useEffect, useState } from 'react'
import { ListItem } from '@shared/atoms/Lists'
import Button from '@shared/atoms/Button'
import styles from './Results.module.css'
import FormHelp from '@shared/FormInput/Help'
import content from '../../../../../content/pages/history.json'
import { useCancelToken } from '@hooks/useCancelToken'
import { getAsset } from '@utils/aquarius'
import { useAccount, useWalletClient } from 'wagmi'
import { toast } from 'react-toastify'
import { prettySize } from '@components/@shared/FormInput/InputElement/FilesInput/utils'
import { customProviderUrl } from 'app.config.cjs'
import { Signer } from 'ethers'
import { useEthersSigner } from '@hooks/useEthersSigner'

export default function Results({
  job
}: {
  job: ComputeJobMetaData
}): ReactElement {
  const providerInstance = new Provider()
  const { address: accountId } = useAccount()
  const walletClient = useEthersSigner() // <-- Updated from useSigner()

  const [datasetProvider, setDatasetProvider] = useState<string>()
  const newCancelToken = useCancelToken()

  const isFinished = job.dateFinished !== null

  useEffect(() => {
    async function getAssetMetadata() {
      if (job.assets) {
        const ddo = await getAsset(job.assets[0].documentId, newCancelToken())
        if (ddo?.credentialSubject?.services?.[0]?.serviceEndpoint) {
          setDatasetProvider(ddo.credentialSubject.services[0].serviceEndpoint)
        } else {
          setDatasetProvider(customProviderUrl)
        }
      } else {
        setDatasetProvider(customProviderUrl)
      }
    }
    getAssetMetadata()
  }, [job.assets, newCancelToken])

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
    if (!accountId || !job || !walletClient) return
    const signer = walletClient as unknown as Signer

    try {
      const envPrefix = (job as any).environment.split('-')[0]
      const compositeId = `${envPrefix}-${job.jobId}`

      const jobResultUrl = await providerInstance.getComputeResultUrl(
        datasetProvider,
        signer,
        compositeId,
        resultIndex
      )

      const jobResultMeta = job.results?.[resultIndex]
      const filename = jobResultMeta?.filename || `result_${resultIndex}`
      const response = await fetch(jobResultUrl)
      if (!response.ok) throw new Error('Failed to fetch file.')

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      const message = getErrorMessage(error.message)
      LoggerInstance.error('[Provider Get c2d results url] Error:', message)
      toast.error(message)
    }
  }

  return (
    <div className={styles.results}>
      <div className={styles.title}>Results</div>
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
                    onClick={() => downloadResults(i)}
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
      <div className={styles.alert}>
        <div className={styles.rightAlert}></div>
        <div>
          <FormHelp className={styles.help}>{content.compute.storage}</FormHelp>
        </div>
      </div>
    </div>
  )
}
