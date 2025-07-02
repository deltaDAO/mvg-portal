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
  did
}: {
  title: string
  symbol: string
  did: string
}) {
  return (
    <div className={styles.asset}>
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
      <p className={styles.assetMeta}>
        <span className={styles.assetMeta}> {`${symbol} | `}</span>
        <code className={styles.assetMeta}>{did}</code>
      </p>
    </div>
  )
}

function DetailsAssets({ job }: { job: ComputeJobMetaData }) {
  const { appConfig } = useMarketMetadata()
  const newCancelToken = useCancelToken()

  const [algoName, setAlgoName] = useState<string>()
  const [algoDtSymbol, setAlgoDtSymbol] = useState<string>()
  const [assetName, setAssetName] = useState<string>()
  const [assetDtSymbol, setAssetDtSymbol] = useState<string>()

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
      if (job.assets) {
        const ddo = (await getAsset(
          job.assets[0].documentId,
          newCancelToken()
        )) as AssetType
        setAssetDtSymbol(ddo.indexedMetadata.stats[0].symbol)
        setAssetName(ddo?.credentialSubject.metadata.name)
      }
    }

    getAlgoMetadata()
    getAssetsMetadata()
  }, [appConfig.metadataCacheUri, job.algorithm, newCancelToken])

  return (
    <>
      <Asset
        title={assetName}
        symbol={assetDtSymbol}
        did={job.assets ? job.assets[0].documentId : job.jobId}
      />
      <Asset
        title={algoName}
        symbol={algoDtSymbol}
        did={job.algorithm.documentId}
      />
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
                date={((job as any).algoStartTimestamp * 1000).toString()}
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
