import { ChangeEvent, useState } from 'react'
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

const cx = classNames.bind(styles)

export interface AssetSelectionAsset {
  did: string
  name: string
  price: number
  tokenSymbol: string
  checked: boolean
  symbol: string
  isAccountIdWhitelisted: boolean
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
  selected?: string
  multiple?: boolean
  disabled?: boolean
  accountId?: string
}): JSX.Element {
  const [searchValue, setSearchValue] = useState('')

  const styleClassesWrapper = `${styles.selection} ${
    disabled ? styles.disabled : ''
  }`
  const styleClassesInput = `${styles.input} ${
    multiple ? styles.checkbox : styles.radio
  }`

  function handleSearchInput(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value)
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
          assets
            .filter((asset: AssetSelectionAsset) =>
              searchValue !== ''
                ? asset.name
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                  asset.did.toLowerCase().includes(searchValue.toLowerCase()) ||
                  asset.symbol.toLowerCase().includes(searchValue.toLowerCase())
                : asset
            )
            .map((asset: AssetSelectionAsset) => (
              <div className={styles.row} key={asset.did}>
                <input
                  id={slugify(asset.did)}
                  className={styleClassesInput}
                  {...props}
                  checked={selected && asset.did === selected}
                  defaultChecked={asset.checked}
                  disabled={disabled || !asset.isAccountIdWhitelisted}
                  type={multiple ? 'checkbox' : 'radio'}
                  value={asset.did}
                />
                <label
                  className={styles.label}
                  htmlFor={slugify(asset.did)}
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
                      {asset.name}
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
            ))
        )}
      </div>
    </div>
  )
}
