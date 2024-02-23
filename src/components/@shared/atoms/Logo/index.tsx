import { ReactElement } from 'react'
import LogoAsset from '@images/pontusx_logo_horizontal.svg'
import LogoAssetSmall from '@images/pontusx_logo.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return (
    <div className={styles.logoWrapper}>
      <LogoAsset className={styles.logo} />
      <LogoAssetSmall className={styles.logoSmall} />
    </div>
  )
}
