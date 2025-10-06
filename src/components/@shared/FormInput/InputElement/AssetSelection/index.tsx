import { useEffect, useState } from 'react'
import cs from 'classnames'
import slugify from 'slugify'
import PriceUnit from '@shared/Price/PriceUnit'
import External from '@images/external.svg'
import Loader from '@shared/atoms/Loader'
import Tooltip from '@components/@shared/atoms/Tooltip'
import WhitelistIndicator from '@components/Asset/AssetActions/Compute/WhitelistIndicator'
import { Badge } from '@components/@shared/VerifiedBadge'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import Pagination from '@components/@shared/Pagination'
import { useAccount } from 'wagmi'
import SearchSection from '@shared/SearchSection'

const cx = classNames.bind(styles)

export interface AssetSelectionAsset {
  did: string
  serviceId: string
  serviceName: string
  description?: string
  serviceDescription?: string
  name: string
  price: number
  tokenSymbol: string
  checked: boolean
  symbol: string
  isAccountIdWhitelisted: boolean
  datetime?: string
  serviceDuration?: number
  serviceType?: string
}

export interface PublisherTrustedAlgorithmService {
  did: string
  filesChecksum: string
  containerSectionChecksum: string
  serviceId: string
}

export function Empty({ message }: { message: string }) {
  return <div className={styles.empty}>{message}</div>
}

export default function AssetSelection({
  assets,
  selected,
  multiple,
  disabled,
  accountId,
  priceOnRight,
  ...props
}: {
  assets: AssetSelectionAsset[]
  selected?: string[]
  multiple?: boolean
  disabled?: boolean
  accountId?: string
  priceOnRight?: boolean
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredAssets, setFilteredAssets] = useState<AssetSelectionAsset[]>(
    []
  )
  const { address: userAccount } = useAccount()

  const [currentPage, setCurrentPage] = useState(1)

  const assetsPerPage = 8
  function isAssetSelected(
    sel: string[] | undefined,
    asset: AssetSelectionAsset
  ) {
    if (!sel || sel.length === 0) return false
    for (const s of sel) {
      if (s === asset.serviceId) return true
      try {
        const parsed = JSON.parse(s) as { algoDid?: string; serviceId?: string }
        if (
          parsed?.serviceId === asset.serviceId &&
          (!parsed?.algoDid || parsed.algoDid === asset.did)
        ) {
          return true
        }
      } catch {
        // ignore parse errors; not JSON
      }
    }
    return false
  }

  const handlePageOnChange = (page: number) => {
    const pageNumber = page + 1
    setCurrentPage(pageNumber)
  }

  useEffect(() => {
    if (!assets || !Array.isArray(assets)) {
      setFilteredAssets([])
      return
    }

    const result = assets.filter((asset) =>
      searchValue !== ''
        ? asset.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.did.toLowerCase().includes(searchValue.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchValue.toLowerCase())
        : true
    )

    // Sort: selected first; both selected and unselected are sorted by datetime (newest first)
    result.sort((a, b) => {
      const aSelected = isAssetSelected(selected, a) ? 1 : 0
      const bSelected = isAssetSelected(selected, b) ? 1 : 0
      if (aSelected !== bSelected) return bSelected - aSelected
      const aTime = a.datetime ? new Date(a.datetime).getTime() : 0
      const bTime = b.datetime ? new Date(b.datetime).getTime() : 0
      return bTime - aTime
    })

    setFilteredAssets(result)
    setCurrentPage(1)
  }, [assets, searchValue, selected])

  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage)
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * assetsPerPage,
    currentPage * assetsPerPage
  )

  const styleClassesWrapper = `${styles.selection} ${
    disabled ? styles.disabled : ''
  }`
  const styleClassesInput = `${styles.input} ${
    multiple ? styles.checkbox : styles.radio
  }`

  return (
    <div className={cs(styles.root, styleClassesWrapper)}>
      <SearchSection
        value={searchValue}
        onChange={setSearchValue}
        disabled={disabled}
      />
      <div className={styles.scroll}>
        {!assets ? (
          <Loader />
        ) : assets && !assets.length ? (
          <Empty message="No assets found." />
        ) : (
          <>
            {paginatedAssets.map((asset: AssetSelectionAsset) => (
              <div
                className={styles.row}
                key={`${asset.did}-${asset.serviceId}`}
              >
                <input
                  id={slugify(`${asset.did}-${asset.serviceId}`)}
                  className={styleClassesInput}
                  {...props}
                  checked={isAssetSelected(selected, asset)}
                  disabled={disabled || !asset.isAccountIdWhitelisted}
                  type={multiple ? 'checkbox' : 'radio'}
                  value={JSON.stringify({
                    algoDid: asset.did,
                    serviceId: asset.serviceId
                  })}
                />
                <label
                  className={cx({
                    label: true,
                    priceOnRight
                  })}
                  htmlFor={slugify(`${asset.did}-${asset.serviceId}`)}
                  title={asset.name}
                >
                  <div className={styles.labelContent}>
                    <div className={styles.titleRow}>
                      <h3 className={styles.title}>
                        {asset.name} - {asset.serviceName}
                        <a
                          className={styles.link}
                          href={`/asset/${asset.did}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <External />
                        </a>
                      </h3>
                    </div>
                    <div className={styles.didContainer}>
                      {asset.symbol} | {asset.did}
                    </div>
                  </div>

                  <div className={styles.priceContainer}>
                    <PriceUnit
                      price={asset.price}
                      size="small"
                      className={cx({
                        price: true,
                        disabled: !asset.isAccountIdWhitelisted
                      })}
                      symbol={asset.tokenSymbol}
                    />

                    {!asset.isAccountIdWhitelisted && (
                      <Tooltip
                        content={
                          <WhitelistIndicator
                            accountId={accountId || userAccount}
                            isAccountIdWhitelisted={false}
                            minimal
                          />
                        }
                      >
                        <Badge
                          isValid={false}
                          verifiedService="Access denied"
                        />
                      </Tooltip>
                    )}
                  </div>
                </label>
              </div>
            ))}
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onChangePage={handlePageOnChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
