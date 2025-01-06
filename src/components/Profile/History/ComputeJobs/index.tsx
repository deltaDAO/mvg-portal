import { ReactElement, useState } from 'react'
import Time from '@shared/atoms/Time'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Button from '@shared/atoms/Button'
import Details from './Details'
import Refresh from '@images/refresh.svg'
import { useUserPreferences } from '@context/UserPreferences'
import NetworkName from '@shared/NetworkName'
import styles from './index.module.css'
import AssetListTitle from '@shared/AssetListTitle'
import { useAccount } from 'wagmi'
import { getAsset } from '@utils/aquarius'
import { useCancelToken } from '@hooks/useCancelToken'
import { getPdf } from '@utils/invoice/createInvoice'
import { decodeBuyComputeJob } from '../../../../@types/invoice/buyInvoice'

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
  },
  {
    name: 'Actions',
    selector: (row) => <Details job={row} />
  }
]

export default function ComputeJobs({
  minimal,
  jobs,
  isLoading,
  refetchJobs
}: {
  minimal?: boolean
  jobs?: ComputeJobMetaData[]
  isLoading?: boolean
  refetchJobs?: any
}): ReactElement {
  const { address: accountId } = useAccount()
  const { chainIds } = useUserPreferences()

  const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null)
  const [pdfUrls, setPdfUrls] = useState({})
  const [loadingInvoiceJson, setLoadingInvoiceJson] = useState<string | null>(
    null
  )
  const [jsonInvoices, setJsonInvoices] = useState({})
  const newCancelToken = useCancelToken()

  async function handleGeneratePdf(row: ComputeJobMetaData) {
    try {
      setLoadingInvoice(row.agreementId)
      let pdfUrlsResponse: Blob[]
      if (!jsonInvoices[row.agreementId]) {
        const assetAlgo = await getAsset(row.algoDID, newCancelToken())
        const asset = await getAsset(row.inputDID[0], newCancelToken())
        const priceAlgo = assetAlgo.stats.price.value
        const priceAsset = asset.stats.price.value
        const ownerAlgo = assetAlgo.event.from
        const ownerAsset = asset.event.from

        const response = await decodeBuyComputeJob(
          row.agreementId,
          asset.id,
          asset.chainId,
          row.algoDID,
          asset.stats.price.tokenSymbol,
          assetAlgo.stats.price.tokenSymbol,
          asset.stats.price.tokenAddress,
          assetAlgo.stats.price.tokenAddress,
          priceAsset,
          priceAlgo,
          ownerAlgo,
          ownerAsset
        )
        pdfUrlsResponse = await getPdf(response)
      } else {
        pdfUrlsResponse = await getPdf(jsonInvoices[row.agreementId])
      }

      setPdfUrls({ ...pdfUrls, [row.agreementId]: pdfUrlsResponse })
    } catch (error) {
      // Handle error
      console.error('Error:', error)
    } finally {
      setLoadingInvoice(null)
    }
  }

  async function handleGenerateJson(row: ComputeJobMetaData) {
    try {
      setLoadingInvoiceJson(row.agreementId)
      if (!jsonInvoices[row.agreementId]) {
        const assetAlgo = await getAsset(row.algoDID, newCancelToken())
        const asset = await getAsset(row.inputDID[0], newCancelToken())
        const priceAlgo = assetAlgo.stats.price.value
        const priceAsset = asset.stats.price.value
        const ownerAlgo = assetAlgo.event.from
        const ownerAsset = asset.event.from

        const response = await decodeBuyComputeJob(
          row.agreementId,
          asset.id,
          asset.chainId,
          row.algoDID,
          asset.stats.price.tokenSymbol,
          assetAlgo.stats.price.tokenSymbol,
          asset.stats.price.tokenAddress,
          assetAlgo.stats.price.tokenAddress,
          priceAsset,
          priceAlgo,
          ownerAlgo,
          ownerAsset
        )
        setJsonInvoices({ ...jsonInvoices, [row.agreementId]: response })
      }
    } catch (error) {
      // Handle error
      console.error('Error:', error)
    } finally {
      setLoadingInvoiceJson(null)
    }
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
    },
    {
      name: 'Actions',
      selector: (row) => <Details job={row} />
    },
    {
      name: 'Invoices PDF',
      selector: (row) => {
        if (pdfUrls[row.agreementId] && pdfUrls[row.agreementId].length > 0) {
          return (
            <>
              {pdfUrls[row.agreementId].map(
                (pdfBuffer: Blob, index: number) => {
                  return (
                    <span key={index}>
                      <a
                        key={index}
                        href={URL.createObjectURL(pdfBuffer)}
                        download={`${row.agreementId}_${index + 1}.pdf`}
                      >
                        Invoice {index + 1}
                      </a>
                      {(index + 1) % 2 === 0 && <br />}{' '}
                    </span>
                  )
                }
              )}
            </>
          )
        } else {
          return (
            <Button
              style="text"
              size="small"
              onClick={() => handleGeneratePdf(row)}
              disabled={loadingInvoice !== null}
            >
              {loadingInvoice === row.agreementId
                ? 'Generating...'
                : 'Generate PDF'}
            </Button>
          )
        }
      }
    },
    {
      name: 'Invoices JSON',
      selector: (row) => {
        if (
          jsonInvoices[row.agreementId] &&
          jsonInvoices[row.agreementId].length > 0
        ) {
          return (
            <>
              {jsonInvoices[row.agreementId].map(
                (json: string, index: number) => {
                  return (
                    <span key={index}>
                      <a
                        href={`data:text/json;charset=utf-8,${encodeURIComponent(
                          JSON.stringify(json)
                        )}`}
                        download={`invoice_${row.agreementId}_${
                          index + 1
                        }.json`}
                      >
                        Invoice_{index + 1}
                      </a>
                      {(index + 1) % 2 === 0 && <br />}{' '}
                    </span>
                  )
                }
              )}
            </>
          )
        } else {
          return (
            <Button
              style="text"
              size="small"
              onClick={() => handleGenerateJson(row)}
              disabled={loadingInvoiceJson !== null}
            >
              {loadingInvoiceJson === row.agreementId
                ? 'Generating...'
                : 'Generate Json'}
            </Button>
          )
        }
      }
    }
  ]

  const [columnsMinimal] = useState([columns[5], columns[6], columns[4]])

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
        columns={minimal ? columnsMinimal : columns}
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
