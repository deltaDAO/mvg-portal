import { ReactElement } from 'react'
import Table, { TableOceanColumn } from '@shared/atoms/Table'
import Time from '@shared/atoms/Time'
import AssetTitle from '@shared/AssetListTitle'
import NetworkName from '@shared/NetworkName'
import { useProfile } from '@context/Profile'
import { useUserPreferences } from '@context/UserPreferences'
// import Button from '@components/@shared/atoms/Button'
// import { getPdf } from '@utils/invoice/createInvoice'
// import { decodeBuyDataSet } from '../../../@types/invoice/buyInvoice'
// import { getOceanConfig } from '@utils/ocean'
// import { InvoiceData } from 'src/@types/invoice/InvoiceData'

export default function ComputeDownloads({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { downloads, downloadsTotal, isDownloadsLoading, handlePageChange } =
    useProfile()
  const { chainIds } = useUserPreferences()
  // const [loadingInvoice, setLoadingInvoice] = useState<string | null>(null)
  // const [pdfUrls, setPdfUrls] = useState({})
  // const [loadingInvoiceJson, setLoadingInvoiceJson] = useState<string | null>(
  //   null
  // )
  // const [jsonInvoices, setJsonInvoices] = useState({})

  // async function handleGeneratePdf(row: DownloadedAsset) {
  //   try {
  //     setLoadingInvoice(row.asset.id)
  //     let pdfUrlsResponse: Blob[]
  //     if (!jsonInvoices[row.asset.id]) {
  //       const config = getOceanConfig(row.asset?.credentialSubject?.chainId)
  //       const invoiceData: InvoiceData[] = []

  //       for (const dt of row.asset.indexedMetadata.stats) {
  //         try {
  //           const result = await decodeBuyDataSet(
  //             row.asset.id,
  //             dt.datatokenAddress,
  //             row.asset.credentialSubject.chainId,
  //             row.asset.indexedMetadata.stats.symbol || 'OCEAN',
  //             dt.prices[0].token || config.oceanTokenAddress,
  //             Number(dt.prices[0].price),
  //             accountId
  //           )
  //           invoiceData.push(...result)
  //         } catch (err) {
  //           console.warn(
  //             `No matching OrderStarted event for datatoken ${dt.address}`
  //           )
  //         }
  //       }

  //       if (invoiceData.length === 0) {
  //         throw new Error(
  //           'No matching OrderStarted events found for any datatoken.'
  //         )
  //       }
  //       pdfUrlsResponse = await getPdf(invoiceData)
  //     } else {
  //       pdfUrlsResponse = await getPdf(jsonInvoices[row.asset.id])
  //     }
  //     setPdfUrls({ ...pdfUrls, [row.asset.id]: pdfUrlsResponse })
  //   } catch (error) {
  //     // Handle error
  //     console.error('Error:', error)
  //   } finally {
  //     setLoadingInvoice(null)
  //   }
  // }

  // async function handleGenerateJson(row: DownloadedAsset) {
  //   try {
  //     setLoadingInvoiceJson(row.asset.id)

  //     if (!jsonInvoices[row.asset.id]) {
  //       const config = getOceanConfig(row.asset?.credentialSubject?.chainId)
  //       const invoiceData: InvoiceData[] = []

  //       for (const dt of row.asset.indexedMetadata.stats) {
  //         try {
  //           const result = await decodeBuyDataSet(
  //             row.asset.id,
  //             dt.datatokenAddress,
  //             row.asset.credentialSubject.chainId,
  //             dt.symbol || 'OCEAN',
  //             dt.prices[0].token || config.oceanTokenAddress,
  //             Number(dt.prices[0].price),
  //             accountId
  //           )
  //           invoiceData.push(...result)
  //         } catch (err) {
  //           console.warn(
  //             `No matching OrderStarted event for datatoken ${dt.address}`
  //           )
  //         }
  //       }

  //       if (invoiceData.length === 0) {
  //         throw new Error(
  //           'No matching OrderStarted events found for any datatoken.'
  //         )
  //       }

  //       setJsonInvoices({ ...jsonInvoices, [row.asset.id]: invoiceData })
  //     }
  //   } catch (error) {
  //     console.error('Error:', error)
  //   } finally {
  //     setLoadingInvoiceJson(null)
  //   }
  // }

  const columns: TableOceanColumn<DownloadedAsset>[] = [
    {
      name: 'Dataset',
      selector: (row) => <AssetTitle asset={row.asset} />
    },
    {
      name: 'Network',
      selector: (row) => <NetworkName networkId={row.networkId} />
    },
    {
      name: 'Datatoken',
      selector: (row) => row.dtSymbol
    },
    {
      name: 'Time',
      selector: (row) => (
        <Time date={row.timestamp.toString()} relative isUnix />
      )
    }
    // {
    //   name: 'Invoices PDF',
    //   selector: (row) => {
    //     if (pdfUrls[row.asset.id] && pdfUrls[row.asset.id].length > 0) {
    //       return (
    //         <>
    //           {pdfUrls[row.asset.id].map((pdfBuffer: Blob, index: number) => {
    //             return (
    //               <span key={index}>
    //                 <a
    //                   key={index}
    //                   href={URL.createObjectURL(pdfBuffer)}
    //                   download={`${row.asset.id}_${index + 1}.pdf`}
    //                 >
    //                   Invoice {index + 1}
    //                 </a>
    //                 {(index + 1) % 2 === 0 && <br />}{' '}
    //               </span>
    //             )
    //           })}
    //         </>
    //       )
    //     } else {
    //       return (
    //         <Button
    //           style="text"
    //           size="small"
    //           onClick={() => handleGeneratePdf(row)}
    //           disabled={loadingInvoice !== null}
    //         >
    //           {loadingInvoice === row.asset.id
    //             ? 'Generating...'
    //             : 'Generate Pdf'}
    //         </Button>
    //       )
    //     }
    //   }
    // },
    // {
    //   name: 'Invoices JSON',
    //   selector: (row) => {
    //     if (
    //       jsonInvoices[row.asset.id] &&
    //       jsonInvoices[row.asset.id].length > 0
    //     ) {
    //       return (
    //         <>
    //           {jsonInvoices[row.asset.id].map((json: string, index: number) => {
    //             return (
    //               <span key={index}>
    //                 <a
    //                   href={`data:text/json;charset=utf-8,${encodeURIComponent(
    //                     JSON.stringify(json)
    //                   )}`}
    //                   download={`invoice_${row.asset.id}_${index + 1}.json`}
    //                 >
    //                   Invoice_{index + 1}
    //                 </a>
    //                 {(index + 1) % 2 === 0 && <br />}{' '}
    //               </span>
    //             )
    //           })}
    //         </>
    //       )
    //     } else {
    //       return (
    //         <Button
    //           style="text"
    //           size="small"
    //           onClick={() => handleGenerateJson(row)}
    //           disabled={loadingInvoiceJson !== null}
    //         >
    //           {loadingInvoiceJson === row.asset.id
    //             ? 'Generating...'
    //             : 'Generate Json'}
    //         </Button>
    //       )
    //     }
    //   }
    // }
  ]

  return accountId ? (
    <Table
      columns={columns}
      data={downloads}
      pagination
      paginationServer
      paginationPerPage={9}
      paginationTotalRows={downloadsTotal}
      onChangePage={handlePageChange}
      isLoading={isDownloadsLoading}
      emptyMessage={chainIds.length === 0 ? 'No network selected' : null}
    />
  ) : (
    <div>Please connect your wallet.</div>
  )
}
