import { Link } from 'gatsby'
import React, { ReactElement } from 'react'
import { ReactComponent as VerifiedPatchIcon } from '../../../../images/patch_check.svg'
import { useProfile } from '../../../../providers/Profile'
import Tooltip from '../../../atoms/Tooltip'
import styles from './VerifiedPatch.module.css'

export default function VerifiedPatch(): ReactElement {
  const { isVerifiedMember } = useProfile()

  const tooltip = (
    <span>
      This member has been officially onboarded to the GEN-X network.{' '}
      <Link to="#">Learn more</Link>
    </span>
  )

  return isVerifiedMember ? (
    <Tooltip content={tooltip}>
      <span className={styles.patch}>
        &nbsp;
        <VerifiedPatchIcon />
      </span>
    </Tooltip>
  ) : (
    <></>
  )
}
