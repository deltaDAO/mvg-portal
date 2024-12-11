import { ReactElement } from 'react'
import DataTable, { TableProps, TableColumn } from 'react-data-table-component'
import Loader from '../Loader'
import Pagination from '@shared/Pagination'
import { PaginationComponent } from 'react-data-table-component/dist/src/DataTable/types'
import Empty from './Empty'
import { customStyles } from './_styles'
import useNetworkMetadata, {
  getNetworkDataById,
  getNetworkDisplayName
} from '@hooks/useNetworkMetadata'
import Button from '../Button'
import styles from './index.module.css'
import NumberUnit from '@components/Profile/Header/NumberUnit'

// Hack in support for returning components for each row, as this works,
// but is not supported by the typings.
export interface TableOceanColumn<T> extends TableColumn<T> {
  selector?: (row: T) => any
}

export interface TableOceanProps<T> extends TableProps<T> {
  columns: TableOceanColumn<T>[]
  isLoading?: boolean
  emptyMessage?: string
  sortField?: string
  sortAsc?: boolean
  className?: string
  exportEnabled?: boolean
  onPageChange?: React.Dispatch<React.SetStateAction<number>>
  showPagination?: boolean
  page?: number
  totalPages?: number
  revenue: number
  sales: number
  items: number
}

export default function HistoryTable({
  data,
  columns,
  isLoading,
  emptyMessage,
  exportEnabled,
  pagination,
  paginationPerPage,
  sortField,
  sortAsc,
  className,
  onPageChange,
  showPagination,
  page,
  totalPages,
  revenue,
  sales,
  items,
  ...props
}: TableOceanProps<any>): ReactElement {
  const { networksList } = useNetworkMetadata()

  const handleExport = () => {
    const exportData = data.map((asset) => {
      const exportedAsset = {}
      columns.forEach((col) => {
        const value = col.selector(asset)

        if (col.name === 'Dataset') {
          exportedAsset[col.name as string] = asset.metadata?.name
        } else if (col.name === 'Network') {
          const networkData = getNetworkDataById(networksList, asset.chainId)
          exportedAsset[col.name as string] = getNetworkDisplayName(networkData)
        } else if (col.name === 'Time') {
          exportedAsset[col.name as string] = new Date(
            asset.event.datetime
          ).toLocaleString()
        } else {
          exportedAsset[col.name as string] = value
        }
      })
      return exportedAsset
    })

    const exportObject = {
      dataset: exportData,
      totalSales: sales,
      totalPublished: items,
      totalRevenue: revenue
    }

    const jsonString = JSON.stringify(exportObject, null, 2)

    // Create Blob and download JSON file
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.setAttribute('hidden', '')
    a.setAttribute('href', url)
    a.setAttribute('download', 'historyData.json')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function handlePageChange(selected: number) {
    onPageChange(selected + 1)
  }

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={data}
        pagination={pagination || data?.length >= 9}
        paginationPerPage={paginationPerPage || 10}
        noDataComponent={<Empty message={emptyMessage} />}
        progressPending={isLoading}
        progressComponent={<Loader />}
        paginationComponent={Pagination as unknown as PaginationComponent}
        defaultSortFieldId={sortField}
        defaultSortAsc={sortAsc}
        theme="ocean"
        customStyles={customStyles}
        {...props}
      />
      {showPagination && !isLoading && (
        <>
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onChangePage={handlePageChange}
          />

          <div className={styles.totalContainer}>
            <NumberUnit label="Total sales" value={sales} />
            <NumberUnit label="Total published" value={items} />
            <NumberUnit label="Total Revenue Ocean" value={revenue} />
          </div>
        </>
      )}
      {exportEnabled && !isLoading && (
        <div className={styles.buttonContainer}>
          <Button onClick={handleExport} style="primary">
            Export data
          </Button>
        </div>
      )}
    </div>
  )
}
