import { ReactElement } from 'react'
import Tooltip from '@shared/atoms/Tooltip'
import Cog from '@images/cog.svg'
import styles from './index.module.css'
import Debug from './Debug'
import Caret from '@images/caret.svg'
import Onboarding from './Onboarding'
import ExternalContent from './ExternalContent'
import SsiWalletApiOption from './SsiWalletApiOption'
import appConfig from 'app.config.cjs'
import { useAccount } from 'wagmi'
import SsiWalletManager from '../SsiWallet/SsiWalletManager'

export default function UserPreferences(): ReactElement {
  const { isConnected } = useAccount()
  return (
    <>
      <Tooltip
        content={
          <ul className={styles.preferencesDetails}>
            <li>
              <ExternalContent />
            </li>
            <li>
              <Onboarding />
            </li>
            {appConfig.ssiEnabled && isConnected && (
              <li>
                <SsiWalletApiOption />
              </li>
            )}
            <li>
              <Debug />
            </li>
          </ul>
        }
        trigger="click focus mouseenter"
        className={styles.preferences}
      >
        <>
          <Cog aria-label="Preferences" className={styles.icon} />
          <Caret aria-hidden="true" className={styles.caret} />
        </>
      </Tooltip>
      <SsiWalletManager />
    </>
  )
}
