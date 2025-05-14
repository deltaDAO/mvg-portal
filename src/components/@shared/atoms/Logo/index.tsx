import { ReactElement } from 'react'
import LogoAsset from '@images/cliox_logo_vertical.svg'
import LogoAssetSmall from '@images/cliox.svg'
import LogoAssetHorizontal from '@images/cliox_logo_horizontal_02.svg'
import styles from './index.module.css'

interface LogoProps {
  variant?: 'default' | 'horizontal' | 'small'
}

export default function Logo({ variant = 'default' }: LogoProps): ReactElement {
  if (variant === 'horizontal') {
    return <LogoAssetHorizontal className={styles.logoHorizontal} />
  }

  if (variant === 'small') {
    return <LogoAssetSmall className={styles.logoSmall} />
  }

  // Default responsive behavior
  return (
    <div className={styles.logoWrapper}>
      <LogoAsset className={styles.logo} />
      <LogoAssetSmall className={styles.logoSmall} />
    </div>
  )
}
