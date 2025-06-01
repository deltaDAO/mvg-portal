import { useUserPreferences } from '@context/UserPreferences'
import Refresh from '@images/refresh.svg'
import AssetListTitle from '@shared/AssetListTitle'
import NetworkName from '@shared/NetworkName'
import Button from '@shared/atoms/Button'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Time from '@shared/atoms/Time'
import { ReactElement, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import Details from './Details'
import styles from './index.module.css'

export function Status({ children }: { children: string }): ReactElement {
  return <div className={styles.status}>{children}</div>
}

const columns: TableOceanColumn<ComputeJobMetaData>[] = [
  {
    name: 'Dataset',
    selector: (row) => (
      <AssetListTitle did={row.inputDID[0]} title={row.assetName} />
    )
  },
  {
    name: 'Network',
    selector: (row) => <NetworkName networkId={row.networkId} />
  },
  {
    name: 'Provider',
    selector: (row) => <span title={row.providerUrl}>{row.providerUrl}</span>
  },
  {
    name: 'Created',
    selector: (row) => <Time date={row.dateCreated} isUnix relative />
  },
  {
    name: 'Finished',
    selector: (row) =>
      row.dateFinished ? <Time date={row.dateFinished} isUnix relative /> : ''
  },
  {
    name: 'Status',
    selector: (row) => <Status>{row.statusText}</Status>
  }
]

const defaultActionsColumn: TableOceanColumn<ComputeJobMetaData> = {
  name: 'Actions',
  selector: (row) => <Details job={row} />
}

export type GetCustomActions = (job: ComputeJobMetaData) => {
  label: ReactElement
  onClick: (job: ComputeJobMetaData) => void
}[]

export default function ComputeJobs({
  minimal,
  jobs,
  isLoading,
  refetchJobs,
  getActions,
  hideDetails
}: {
  minimal?: boolean
  jobs?: ComputeJobMetaData[]
  isLoading?: boolean
  refetchJobs?: any
  getActions?: (job: ComputeJobMetaData) => {
    label: ReactElement
    onClick: (job: ComputeJobMetaData) => void
  }[]
  hideDetails?: boolean
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chainIds } = useUserPreferences()

  const [actionsColumn, setActionsColumn] =
    useState<TableOceanColumn<ComputeJobMetaData>>(defaultActionsColumn)

  useEffect(() => {
    if (!getActions) return
    setActionsColumn({
      name: defaultActionsColumn.name,
      selector: (row) => (
        <div className={styles.customActios}>
          {getActions(row).map((action, i) => (
            <Button
              key={`compute-job-action-${action.label}-${i}`}
              size="small"
              style="text"
              onClick={() => action.onClick(row)}
              className={styles.customActionButton}
            >
              {action.label}
            </Button>
          ))}
          {!hideDetails && <Details job={row} />}
        </div>
      )
    })
  }, [getActions])

  return accountId ? (
    <>
      {jobs?.length >= 0 && !minimal && (
        <Button
          style="text"
          size="small"
          title="Refresh compute jobs"
          onClick={async () => await refetchJobs(true)}
          disabled={isLoading}
          className={styles.refresh}
        >
          <Refresh />
          Refresh
        </Button>
      )}
      <Table
        columns={
          minimal
            ? // for minimal view, we only want 'Status', actions and 'Finished'
              [columns[5], actionsColumn, columns[4]]
            : [...columns, actionsColumn]
        }
        data={jobs}
        isLoading={isLoading}
        defaultSortFieldId="row.dateCreated"
        defaultSortAsc={false}
        emptyMessage={chainIds.length === 0 ? 'No network selected' : null}
        onChangePage={async () => await refetchJobs(true)}
      />
    </>
  ) : (
    <div>Please connect your wallet.</div>
  )
}
