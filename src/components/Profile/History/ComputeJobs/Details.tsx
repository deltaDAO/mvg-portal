import { ReactElement, useEffect, useState } from 'react'
import Time from '@shared/atoms/Time'
import Button from '@shared/atoms/Button'
import Modal from '@shared/atoms/Modal'
import External from '@images/external.svg'
import { getAsset } from '@utils/aquarius'
import Results from './Results'
import styles from './Details.module.css'
import { useCancelToken } from '@hooks/useCancelToken'
import MetaItem from '../../../Asset/AssetContent/MetaItem'
import { useMarketMetadata } from '@context/MarketMetadata'
import { Asset as AssetType } from 'src/@types/Asset'

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
      <div className={styles.assetMetaBlock}>
        <span className={styles.assetLabel}>Symbol:</span>
        <code className={styles.assetCode}>{symbol}</code>
      </div>
      <div className={styles.assetMetaBlock}>
        <span className={styles.assetLabel}>DID:</span>
        <code className={styles.assetCode}>{did}</code>
      </div>
      {serviceId && (
        <div className={styles.assetMetaBlock}>
          <span className={styles.assetLabel}>Service ID:</span>
          <code className={styles.assetCode}>{serviceId}</code>
        </div>
      )}
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
        setAlgoName(ddo?.credentialSubject.metadata.name)
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
      <h3 className={styles.sectionLabel}>Input Datasets</h3>
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
      </div>
      <h3 className={styles.sectionLabel}>Algorithm</h3>
      <div className={styles.assetListBox}>
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
  return (
    <>
      <Button style="text" size="small" onClick={() => setIsDialogOpen(true)}>
        Show Details
      </Button>
      <Modal
        title={job.statusText}
        isOpen={isDialogOpen}
        onToggleModal={() => setIsDialogOpen(false)}
      >
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
                  date={((job as any).algoStopTimestamp * 1000).toString()}
                  isUnix
                  relative
                />
              }
            />
          )}
          <MetaItem title="Job ID" content={<code>{job.jobId}</code>} />
        </div>
      </Modal>
    </>
  )
}
