import React, { ReactElement } from 'react'
import Tooltip from '@shared/atoms/Tooltip'
import Cog from '@images/cog.svg'
import styles from './index.module.css'
import Debug from './Debug'
import Caret from '@images/caret.svg'
import ExternalContent from './ExternalContent'

export default function UserPreferences(): ReactElement {
  return (
    <Tooltip
      content={
        <ul className={styles.preferencesDetails}>
          <li>
            <ExternalContent />
          </li>
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
  )
}
