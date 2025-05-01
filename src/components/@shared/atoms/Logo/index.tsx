import { ReactElement } from 'react'
import styles from './index.module.css'

interface LogoProps {
  darkMode?: boolean
}

export default function Logo({ darkMode = false }: LogoProps): ReactElement {
  return (
    <div className={styles.logoWrapper}>
      {/* Temporary ClioX text logo */}
      <div className="text-4xl font-bold tracking-tight">
        <span className={darkMode ? 'text-blue-100' : 'text-blue-900'}>
          Clio
        </span>
        <span className={darkMode ? 'text-blue-300' : 'text-blue-700'}>X</span>
      </div>
      {/* Mobile version */}
      <div className={`${styles.logoSmall} text-3xl font-bold`}>
        <span className={darkMode ? 'text-blue-100' : 'text-blue-900'}>C</span>
        <span className={darkMode ? 'text-blue-300' : 'text-blue-700'}>X</span>
      </div>
    </div>
  )
}
