import React, { ReactElement, useEffect, useState } from 'react'
import { ComputeJobMetaData } from '../../../../../@types/ComputeJobMetaData'
import Time from '../../../../atoms/Time'
import Button from '../../../../atoms/Button'
import Modal from '../../../../atoms/Modal'
import MetaItem from '../../../../organisms/AssetContent/MetaItem'
import { ReactComponent as External } from '../../../../../images/external.svg'
import { retrieveDDO } from '../../../../../utils/aquarius'
import Results from './Results'
import styles from './Details.module.css'
import { useCancelToken } from '../../../../../hooks/useCancelToken'
import { useSiteMetadata } from '../../../../../hooks/useSiteMetadata'
import { DDO } from '@oceanprotocol/lib'
import axios from 'axios'

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
        {symbol} | <code>{did}</code>
      </p>
    </div>
  )
}

function DetailsAssets({ job, ddo }: { job: ComputeJobMetaData; ddo: DDO }) {
  const [algoName, setAlgoName] = useState<string>()
  const [algoDtSymbol, setAlgoDtSymbol] = useState<string>()
  const newCancelToken = useCancelToken()
  useEffect(() => {
    async function getAlgoMetadata() {
      const ddo = await retrieveDDO(job.algoDID, newCancelToken())
      setAlgoDtSymbol(ddo.dataTokenInfo.symbol)

      const { attributes } = ddo.findServiceByType('metadata')
      setAlgoName(attributes?.main.name)
    }
    getAlgoMetadata()
  }, [ddo])

  return (
    <>
      <Asset
        title={job.assetName}
        symbol={job.assetDtSymbol}
        did={job.inputDID[0]}
      />
      <Asset title={algoName} symbol={algoDtSymbol} did={job.algoDID} />
    </>
  )
}

export default function Details({
  job
}: {
  job: ComputeJobMetaData
}): ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { appConfig } = useSiteMetadata()
  const [ddo, setDdo] = useState<DDO>()

  useEffect(() => {
    async function getAlgoMetadata() {
      const source = axios.CancelToken.source()

      const ddo = await retrieveDDO(job.inputDID[0], source.token)

      setDdo(ddo)
    }
    getAlgoMetadata()
  }, [appConfig.metadataCacheUri, job.algoDID])

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
        <DetailsAssets job={job} ddo={ddo} />
        <Results job={job} ddo={ddo} />

        <div className={styles.meta}>
          <MetaItem
            title="Created"
            content={<Time date={job.dateCreated} isUnix relative />}
          />
          {job.dateFinished && (
            <MetaItem
              title="Finished"
              content={<Time date={job.dateFinished} isUnix relative />}
            />
          )}
          <MetaItem title="Job ID" content={<code>{job.jobId}</code>} />
          {job.resultsDid && (
            <MetaItem
              title="Published Results DID"
              content={<code>{job.resultsDid}</code>}
            />
          )}
        </div>
      </Modal>
    </>
  )
}
