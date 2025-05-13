import { ReactElement } from 'react'
import LogoAsset from '@images/cliox_logo_vertical.svg'
import LogoAssetSmall from '@images/cliox.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return (
    <div className={styles.logoWrapper}>
      <LogoAsset className={styles.logo} />
      <LogoAssetSmall className={styles.logoSmall} />
    </div>
  )
}
