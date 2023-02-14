import React, { ReactElement } from 'react'
import Tooltip from '../../atoms/Tooltip'
import { ReactComponent as Cog } from '../../../images/cog.svg'
import styles from './index.module.css'
import Debug from './Debug'
import { ReactComponent as Caret } from '../../../images/caret.svg'

export default function UserPreferences(): ReactElement {
  return (
    <Tooltip
      content={
        <ul className={styles.preferencesDetails}>
          <Debug />
        </ul>
      }
      trigger="click focus"
      className={styles.preferences}
      zIndex={11}
    >
      <Cog aria-label="Preferences" className={styles.icon} />
      <Caret aria-hidden="true" className={styles.caret} />
    </Tooltip>
  )
}
