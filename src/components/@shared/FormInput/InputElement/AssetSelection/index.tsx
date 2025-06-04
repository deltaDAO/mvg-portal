import { ChangeEvent, useEffect, useState } from 'react'
import Dotdotdot from 'react-dotdotdot'
import slugify from 'slugify'
import PriceUnit from '@shared/Price/PriceUnit'
import External from '@images/external.svg'
import InputElement from '@shared/FormInput/InputElement'
import Loader from '@shared/atoms/Loader'
import Tooltip from '@components/@shared/atoms/Tooltip'
import WhitelistIndicator from '@components/Asset/AssetActions/Compute/WhitelistIndicator'
import { Badge } from '@components/@shared/VerifiedBadge'
import styles from './index.module.css'
import classNames from 'classnames/bind'
import Pagination from '@components/@shared/Pagination'

const cx = classNames.bind(styles)

export interface AssetSelectionAsset {
  did: string
  serviceId: string
  serviceName: string
  name: string
  price: number
  tokenSymbol: string
  checked: boolean
  symbol: string
  isAccountIdWhitelisted: boolean
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
  ...props
}: {
  assets: AssetSelectionAsset[]
  selected?: string[]
  multiple?: boolean
  disabled?: boolean
  accountId?: string
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')
  const [filteredAssets, setFilteredAssets] = useState<AssetSelectionAsset[]>(
    []
  )
  const [currentPage, setCurrentPage] = useState(1)

  const assetsPerPage = 5

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

    setFilteredAssets(result)
    setCurrentPage(1)
  }, [assets, searchValue])

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

  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className={styleClassesWrapper}>
      <InputElement
        type="search"
        name="search"
        size="small"
        placeholder="Search by title, datatoken, or DID..."
        value={searchValue}
        onChange={handleSearchInput}
        className={styles.search}
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
              <div className={styles.row} key={asset.serviceId}>
                <input
                  id={slugify(asset.serviceId)}
                  className={styleClassesInput}
                  {...props}
                  checked={selected && selected.includes(asset.serviceId)}
                  defaultChecked={asset.checked}
                  disabled={disabled || !asset.isAccountIdWhitelisted}
                  type={multiple ? 'checkbox' : 'radio'}
                  value={JSON.stringify({
                    algoDid: asset.did,
                    serviceId: asset.serviceId
                  })}
                />
                <label
                  className={styles.label}
                  htmlFor={slugify(asset.serviceId)}
                  title={asset.name}
                >
                  <h3 className={styles.title}>
                    <Dotdotdot
                      clamp={1}
                      tagName="span"
                      className={cx({
                        disabled: !asset.isAccountIdWhitelisted
                      })}
                    >
                      {asset.name} - {asset.serviceName}
                    </Dotdotdot>
                    <a
                      className={styles.link}
                      href={`/asset/${asset.did}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <External />
                    </a>
                  </h3>

                  <Dotdotdot
                    clamp={1}
                    tagName="code"
                    className={cx({
                      did: true,
                      disabled: !asset.isAccountIdWhitelisted
                    })}
                  >
                    {asset.symbol} | {asset.did}
                  </Dotdotdot>
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
                          accountId={accountId}
                          isAccountIdWhitelisted={false}
                          minimal
                        />
                      }
                    >
                      <Badge isValid={false} verifiedService="Access denied" />
                    </Tooltip>
                  )}
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
