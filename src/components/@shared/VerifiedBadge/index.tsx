import classNames from 'classnames/bind'
import React, { ReactElement } from 'react'
import VerifiedPatch from '@images/patch_check.svg'
import Cross from '@images/cross.svg'
import styles from './index.module.css'
import Loader from '../atoms/Loader'
import Time from '../atoms/Time'

const cx = classNames.bind(styles)

function Badge({
  isValid,
  label
}: {
  isValid: boolean
  label: string
}): ReactElement {
  return (
    <div
      className={cx({
        mainLabel: true,
        isValid
      })}
    >
      <span>{label}</span>
      {isValid ? <VerifiedPatch /> : <Cross />}
    </div>
  )
}

export default function VerifiedBadge({
  className,
  isValid,
  idMatch,
  isLoading,
  apiVersion,
  timestamp
}: {
  className?: string
  isValid?: boolean
  idMatch?: boolean
  isLoading?: boolean
  apiVersion?: string
  timestamp?: boolean
}): ReactElement {
  const styleClasses = cx({
    verifiedBadge: true,
    [className]: className
  })

  const formattedApiVersion =
    apiVersion && apiVersion.slice(0, 2) + '.' + apiVersion.slice(2, 4)

  return (
    <div className={styles.container}>
      {isLoading ? (
        <Loader message="Verifying Service Credential" />
      ) : (
        <div className={styleClasses}>
          <Badge isValid={isValid} label="Service Credential" />
          <Badge isValid={idMatch} label="Credential ID match" />
          <div className={styles.details}>
            {apiVersion && (
              <span className={styles.apiVersion}>
                version: {formattedApiVersion}
              </span>
            )}
            {timestamp && (
              <span className={styles.lastVerified}>
                last check: <Time date={new Date().toString()} relative />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
