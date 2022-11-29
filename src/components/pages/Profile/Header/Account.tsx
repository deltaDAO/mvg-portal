import jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import React, { ReactElement } from 'react'
import { useProfile } from '../../../../providers/Profile'
import { useUserPreferences } from '../../../../providers/UserPreferences'
import Blockies from '../../../atoms/Blockies'
import Copy from '../../../atoms/Copy'
import ExplorerLink from '../../../atoms/ExplorerLink'
import NetworkName from '../../../atoms/NetworkName'
import styles from './Account.module.css'
import VerifiedPatch from './VerifiedPatch'

import { useWeb3 } from '../../../../providers/Web3'
import VerificationModal from './VerificationModal'

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { profile, isVerifiedMember } = useProfile()
  const { accountId: userAccount } = useWeb3()

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {profile?.image ? (
          <img
            src={profile?.image}
            className={styles.image}
            width="96"
            height="96"
          />
        ) : accountId ? (
          <Blockies accountId={accountId} className={styles.image} />
        ) : (
          <img
            src={jellyfish}
            className={styles.image}
            width="96"
            height="96"
          />
        )}
      </figure>

      <div>
        <h3 className={styles.name}>
          {profile?.name}
          {isVerifiedMember && <VerifiedPatch />}
        </h3>
        {accountId === userAccount && !isVerifiedMember && (
          <VerificationModal />
        )}
        {accountId && (
          <code
            className={styles.accountId}
            title={profile?.accountEns ? accountId : null}
          >
            {profile?.accountEns || accountId} <Copy text={accountId} />
          </code>
        )}
        <p>
          {accountId &&
            chainIds.map((value) => (
              <ExplorerLink
                className={styles.explorer}
                networkId={value}
                path={`address/${accountId}`}
                key={value}
              >
                <NetworkName networkId={value} />
              </ExplorerLink>
            ))}
        </p>
      </div>
    </div>
  )
}
