import { ReactElement } from 'react'
import { useUserPreferences } from '@context/UserPreferences'
import ExplorerLink from '@shared/ExplorerLink'
import NetworkName from '@shared/NetworkName'
import Jellyfish from '@oceanprotocol/art/creatures/jellyfish/jellyfish-grid.svg'
import Copy from '@shared/atoms/Copy'
import Avatar from '@shared/atoms/Avatar'
import styles from './Account.module.css'
import { accountTruncate } from '@utils/wallet'
import { useAutomation } from '../../../@context/Automation/AutomationProvider'
import Transaction from '../../../@images/transaction.svg'
import { useAddressConfig } from '@hooks/useAddressConfig'

export default function Account({
  accountId
}: {
  accountId: string
}): ReactElement {
  const { chainIds } = useUserPreferences()
  const { autoWalletAddress } = useAutomation()
  const { verifiedAddresses } = useAddressConfig()

  function getAddressKey(): string {
    const addressKey = Object.keys(verifiedAddresses).find(
      (key) => key.toLowerCase() === accountId?.toLowerCase()
    )
    return addressKey || ''
  }

  return (
    <div className={styles.account}>
      <figure className={styles.imageWrap}>
        {accountId ? (
          <Avatar accountId={accountId} className={styles.image} />
        ) : (
          <Jellyfish className={styles.image} />
        )}
      </figure>
      <div>
        <h3 className={styles.name}>
          {verifiedAddresses?.[getAddressKey()] || accountTruncate(accountId)}{' '}
          {autoWalletAddress === accountId && (
            <span className={styles.automation} title="Automation">
              <Transaction />
            </span>
          )}
        </h3>

        {accountId && (
          <code className={styles.accountId}>
            {accountId} <Copy text={accountId} />
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
