import { ReactElement } from 'react'
import LogoAsset from '@images/brand-logo.svg'
import styles from './index.module.css'

export default function Logo(): ReactElement {
  return <LogoAsset className={styles.logo} />
}
