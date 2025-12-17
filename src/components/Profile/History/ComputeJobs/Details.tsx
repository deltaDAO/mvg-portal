import React, { ReactElement, useEffect, useState } from 'react'
import Time from '@shared/atoms/Time'
import Button from '@shared/atoms/Button'
import styles from './Details.module.css'
import Results from './Results'
import MetaItem from '../../../Asset/AssetContent/MetaItem'
import { useCancelToken } from '@hooks/useCancelToken'
import { useMarketMetadata } from '@context/MarketMetadata'
import { getAsset } from '@utils/aquarius'
import { getServiceById } from '@utils/ddo'
import { CopyToClipboard } from '@shared/CopyToClipboard'
import { Asset as AssetType } from 'src/@types/Asset'
import External from '@images/external.svg'
import CloseIcon from '@images/closeIcon.svg'
import useIsMobile from '@hooks/useIsMobile'

const extractString = (
  value: string | { '@value': string } | undefined
): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && '@value' in value)
    return value['@value']
  return ''
}

function Asset({
  title,
  symbol,
  did,
  serviceName
}: {
  title: string
  symbol: string
  did: string
  serviceId?: string
  serviceName?: string
}) {
  return (
    <div className={styles.assetBox}>
      <div className={styles.assetHeader}>
        <h3 className={styles.assetTitle}>
          <span className={styles.assetTitleText} title={title}>
            {title}
          </span>
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
        {serviceName && (
          <>
            <span className={styles.serviceName} title={serviceName}>
              {serviceName}
            </span>
            <span className={styles.divider}></span>
          </>
        )}
        <div className={styles.didContainer}>
          <CopyToClipboard
            value={did}
            truncate={10}
            textClassName={styles.did}
            className={styles.didCopy}
          />
        </div>
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
    { ddo: AssetType; serviceId?: string; serviceName?: string }[]
  >([])

  useEffect(() => {
    async function getAlgoMetadata() {
      if (job.algorithm) {
        const ddo = (await getAsset(
          job.algorithm.documentId,
          newCancelToken()
        )) as AssetType
        if (ddo) {
          setAlgoDtSymbol(ddo.indexedMetadata.stats[0].symbol)
          setAlgoName(ddo.credentialSubject.metadata.name)
        }
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
            let serviceName: string | undefined
            if (ddo && asset.serviceId) {
              const service = getServiceById(ddo, asset.serviceId)
              if (service) {
                serviceName = extractString(service.name) || undefined
              }
            }
            return { ddo, serviceId: asset.serviceId, serviceName }
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
        {datasetAssets.map(({ ddo, serviceId, serviceName }) => (
          <React.Fragment key={ddo?.id || serviceId}>
            {ddo ? (
              <Asset
                title={ddo.credentialSubject?.metadata.name}
                symbol={ddo.indexedMetadata?.stats[0]?.symbol}
                did={ddo.id}
                serviceId={serviceId}
                serviceName={serviceName}
              />
            ) : (
              <div className={styles.assetNotAvailable}>
                Dataset Asset Not Available
              </div>
            )}
          </React.Fragment>
        ))}

        <hr className={styles.assetDivider} />

        {algoName && algoDtSymbol ? (
          <Asset
            title={algoName}
            symbol={algoDtSymbol}
            did={job.algorithm.documentId}
          />
        ) : (
          <div className={styles.assetNotAvailable}>
            Algorithm Asset Not Available
          </div>
        )}
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
  function formatDuration(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '—'

    const units = [
      { label: 'year', secs: 365 * 24 * 3600 },
      { label: 'month', secs: 30 * 24 * 3600 },
      { label: 'day', secs: 24 * 3600 },
      { label: 'hour', secs: 3600 },
      { label: 'minute', secs: 60 },
      { label: 'second', secs: 1 }
    ]

    let remaining = seconds
    const parts: string[] = []

    for (const { label, secs } of units) {
      const value = Math.floor(remaining / secs)
      if (value > 0) {
        parts.push(`${value} ${label}${value > 1 ? 's' : ''}`)
        remaining -= value * secs
      }
    }
    if (parts.length === 0 && remaining > 0) {
      parts.push(`${remaining.toFixed(3)} seconds`)
    }
    return parts.slice(0, 3).join(' ')
  }

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
              {job.dateFinished && job.dateCreated && (
                <MetaItem
                  title="Duration"
                  content={formatDuration(
                    Number(job.dateFinished) - Number(job.dateCreated)
                  )}
                />
              )}
              {job.dateFinished && (
                <MetaItem
                  title="Job Cost"
                  content={
                    job?.payment?.cost
                      ? `${job.payment.cost.toString()}`
                      : 'FREE'
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
