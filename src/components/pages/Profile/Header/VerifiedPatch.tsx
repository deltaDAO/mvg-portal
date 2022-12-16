import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatchIcon } from '../../../../images/patch_check.svg'
import Tooltip from '../../../atoms/Tooltip'
import styles from './VerifiedPatch.module.css'

export default function VerifiedPatch(): ReactElement {
  const tooltip = (
    <span>
      This member has been officially onboarded to the GEN-X network.{' '}
    </span>
  )

  return (
    <Tooltip content={tooltip}>
      <span className={styles.patch}>
        &nbsp;
        <VerifiedPatchIcon />
      </span>
    </Tooltip>
  )
}
