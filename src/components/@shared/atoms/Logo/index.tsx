import { ReactElement } from 'react'
import LogoAsset from '@images/gaia-x-logo.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return <LogoAsset className={styles.logo} />
}
