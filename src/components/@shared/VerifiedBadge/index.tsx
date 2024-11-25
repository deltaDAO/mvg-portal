import classNames from 'classnames/bind'
import { ReactElement } from 'react'
import VerifiedPatch from '@images/patch_check.svg'
import Cross from '@images/cross.svg'
import styles from './index.module.css'
import Loader from '../atoms/Loader'
import Time from '../atoms/Time'
import Tooltip from '../atoms/Tooltip'

const cx = classNames.bind(styles)

export function Badge({
  isValid,
  matchVerifiable,
  verifiedService,
  className
}: {
  isValid: boolean
  matchVerifiable?: boolean
  verifiedService: string
  className?: string
}): ReactElement {
  return (
    <div
      className={cx({
        mainLabel: true,
        isValid,
        isWarning: matchVerifiable === false,
        [className]: className
      })}
    >
      {matchVerifiable === false && (
        <Tooltip content="gx:dependsOn could not be found" />
      )}
      <span>{verifiedService}</span>
      {typeof matchVerifiable === 'undefined' ? (
        isValid ? (
          <VerifiedPatch />
        ) : (
          <Cross />
        )
      ) : isValid && matchVerifiable ? (
        <VerifiedPatch />
      ) : (
        <Cross />
      )}
    </div>
  )
}

export default function VerifiedBadge({
  className,
  isValid,
  idMatch,
  matchVerifiable,
  isLoading,
  apiVersion,
  timestamp
}: {
  className?: string
  isValid?: boolean
  idMatch?: boolean
  matchVerifiable?: boolean
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
          <Badge isValid={isValid} verifiedService="Service Credential" />
          <Badge
            isValid={idMatch}
            matchVerifiable={matchVerifiable}
            verifiedService="Credential ID match"
          />
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
