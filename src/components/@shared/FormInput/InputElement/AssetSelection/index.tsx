import React, { ChangeEvent, useState } from 'react'
import Dotdotdot from 'react-dotdotdot'
import slugify from 'slugify'
import PriceUnit from '@shared/Price/PriceUnit'
import External from '@images/external.svg'
import InputElement from '@shared/FormInput/InputElement'
import Loader from '@shared/atoms/Loader'
import Tooltip from '@components/@shared/atoms/Tooltip'
import WhitelistIndicator from '@components/Asset/AssetActions/Compute/WhitelistIndicator'
import { useWeb3 } from '@context/Web3'
import { Badge } from '@components/@shared/VerifiedBadge'
import styles from './index.module.css'

export interface AssetSelectionAsset {
  did: string
  name: string
  price: number
  checked: boolean
  symbol: string
  isAccountIdWhitelisted: boolean
}

function Empty() {
  return <div className={styles.empty}>No assets found.</div>
}

export default function AssetSelection({
  assets,
  multiple,
  disabled,
  ...props
}: {
  assets: AssetSelectionAsset[]
  multiple?: boolean
  disabled?: boolean
}): JSX.Element {
  const { accountId } = useWeb3()

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
          <Empty />
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
                  defaultChecked={asset.checked}
                  type={multiple ? 'checkbox' : 'radio'}
                  disabled={disabled || !asset.isAccountIdWhitelisted}
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
                      className={
                        !asset.isAccountIdWhitelisted && styles.disabled
                      }
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
                    className={`${styles.did} ${
                      !asset.isAccountIdWhitelisted && styles.disabled
                    }`}
                  >
                    {asset.symbol} | {asset.did}
                  </Dotdotdot>
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

                <PriceUnit
                  price={asset.price}
                  size="small"
                  className={`${styles.price} ${
                    !asset.isAccountIdWhitelisted && styles.disabled
                  }`}
                />
              </div>
            ))
        )}
      </div>
    </div>
  )
}
