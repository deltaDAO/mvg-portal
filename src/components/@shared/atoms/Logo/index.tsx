import React, { ReactElement } from 'react'
import LogoAssetFull from '@oceanprotocol/art/logo/logo.svg'
import LogoAssetBranding from '@images/brand-logo.svg'
import LogoAsset from '@images/logo.svg'
import styles from './index.module.css'

export interface LogoProps {
  noWordmark?: boolean
  branding?: boolean
}

export default function Logo({
  noWordmark,
  branding
}: LogoProps): ReactElement {
  return branding ? (
    <LogoAssetBranding className={`${styles.logo} ${styles.branding}`} />
  ) : noWordmark ? (
    <LogoAsset className={styles.logo} />
  ) : (
    <LogoAssetFull className={styles.logo} />
  )
}
