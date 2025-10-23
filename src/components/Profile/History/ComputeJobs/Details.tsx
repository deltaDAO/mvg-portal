import { ReactElement, useEffect, useRef, useState } from 'react'
import Time from '@shared/atoms/Time'
import Button from '@shared/atoms/Button'
import styles from './Details.module.css'
import Modal from '@shared/atoms/Modal'
import Results from './Results'
import MetaItem from '../../../Asset/AssetContent/MetaItem'
import { useCancelToken } from '@hooks/useCancelToken'
import { useMarketMetadata } from '@context/MarketMetadata'
import { getAsset } from '@utils/aquarius'
import { Asset as AssetType } from 'src/@types/Asset'
import External from '@images/external.svg'
import CloseIcon from '@images/closeIcon.svg'
import useIsMobile from '@hooks/useIsMobile'

function Asset({
  title,
  symbol,
  did,
  serviceId
}: {
  title: string
  symbol: string
  did: string
  serviceId?: string
}) {
  return (
    <div className={styles.assetBox}>
      <div className={styles.assetHeader}>
        <h3 className={styles.assetTitle}>
          {title}{' '}
          <a
            className={styles.assetLink}
            href={`/asset/${did}`}
            target="_blank"
            rel="noreferrer"
          >
            <External />
          </a>
        </h3>
      </div>
      <div className={styles.assetDetails}>
        <span className={styles.symbol}>{symbol}</span>
        <span className={styles.divider}></span>
        <span className={styles.did} title={did}>
          {did.slice(0, 50)}...
        </span>
      </div>
    </div>
  )
}

function DetailsAssets({ job }: { job: ComputeJobMetaData }) {
  const { appConfig } = useMarketMetadata()
  const newCancelToken = useCancelToken()

  const [algoName, setAlgoName] = useState<string>()
  const [algoDtSymbol, setAlgoDtSymbol] = useState<string>()
  const [datasetAssets, setDatasetAssets] = useState<
    { ddo: AssetType; serviceId?: string }[]
  >([])

  useEffect(() => {
    async function getAlgoMetadata() {
      if (job.algorithm) {
        const ddo = (await getAsset(
          job.algorithm.documentId,
          newCancelToken()
        )) as AssetType
        setAlgoDtSymbol(ddo.indexedMetadata.stats[0].symbol)
        setAlgoName(ddo.credentialSubject.metadata.name)
      }
    }

    async function getAssetsMetadata() {
      if (job.assets && job.assets.length > 0) {
        const allAssets = await Promise.all(
          job.assets.map(async (asset) => {
            const ddo = (await getAsset(
              asset.documentId,
              newCancelToken()
            )) as AssetType
            return { ddo, serviceId: asset.serviceId }
          })
        )
        setDatasetAssets(allAssets)
      }
    }

    getAlgoMetadata()
    getAssetsMetadata()
  }, [appConfig.metadataCacheUri, job.algorithm, job.assets, newCancelToken])

  return (
    <>
      <div className={styles.assetListBox}>
        {datasetAssets.map(({ ddo, serviceId }) => (
          <Asset
            key={ddo.id}
            title={ddo.credentialSubject.metadata.name}
            symbol={ddo.indexedMetadata.stats[0].symbol}
            did={ddo.id}
            serviceId={serviceId}
          />
        ))}
        <hr className={styles.assetDivider} />

        <Asset
          title={algoName}
          symbol={algoDtSymbol}
          did={job.algorithm.documentId}
        />
      </div>
    </>
  )
}

export default function Details({
  job
}: {
  job: ComputeJobMetaData
}): ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <>
      <Button style="text" size="small" onClick={() => setIsDialogOpen(true)}>
        Show Details
      </Button>

      {isDialogOpen && (
        <dialog open className={styles.dialog}>
          <div className={styles.dialogContent}>
            <div className={styles.dialogHeader}>
              <h2>{job.statusText}</h2>
              <CloseIcon
                className={styles.closeIconAbsolute}
                onClick={() => setIsDialogOpen(false)}
                aria-label="Close"
              />
            </div>

            <DetailsAssets job={job} />
            <Results job={job} />

            <div className={styles.meta}>
              <MetaItem
                title="Created"
                content={
                  <Time
                    date={
                      Number((job as any).algoStartTimestamp) > 0
                        ? (
                            Number((job as any).algoStartTimestamp) * 1000
                          ).toString()
                        : (Number(job.dateCreated) * 1000).toString()
                    }
                    isUnix
                    relative
                  />
                }
              />

              {job.dateFinished && (
                <MetaItem
                  title="Finished"
                  content={
                    <Time
                      date={
                        Number((job as any).algoStopTimestamp) > 0
                          ? (
                              Number((job as any).algoStopTimestamp) * 1000
                            ).toString()
                          : (Number(job.dateFinished) * 1000).toString()
                      }
                      isUnix
                      relative
                    />
                  }
                />
              )}

              {job.dateFinished ? (
                // When finished date exists, show JobDID on new line
                <div style={{ flexBasis: '100%' }}>
                  <span className={styles.jobDID}>
                    <MetaItem
                      title="Job ID"
                      content={
                        <code>
                          {isMobile
                            ? `${job.jobId.slice(0, 20)}...`
                            : job.jobId}
                        </code>
                      }
                    />
                  </span>
                </div>
              ) : (
                // Else show it in same row
                <span className={styles.jobDID}>
                  <MetaItem
                    title="Job ID"
                    content={
                      <code>
                        {isMobile ? `${job.jobId.slice(0, 20)}...` : job.jobId}
                      </code>
                    }
                  />
                </span>
              )}
            </div>
            <button
              className={styles.mobileCloseButton}
              onClick={() => setIsDialogOpen(false)}
              aria-label="Close Dialog"
            >
              Close
            </button>
          </div>
        </dialog>
      )}
    </>
  )
}
