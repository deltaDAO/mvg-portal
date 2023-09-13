import React, { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
// import { useOrbis } from '@context/DirectMessages'
import { useDisconnect, useAccount, useConnect } from 'wagmi'
import styles from './Details.module.css'
import Avatar from '@components/@shared/atoms/Avatar'
import Bookmark from '@images/bookmark.svg'
import { MenuLink } from '../Menu'
import AddTokenList from './AddTokenList'
import { GEN_X_NETWORK_ID } from 'chains.config'
import AddNetwork from '@components/@shared/AddNetwork'

export default function Details(): ReactElement {
  const { connector: activeConnector, address: accountId } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className={styles.details}>
      <ul>
        <li className={styles.profileLink}>
          <Avatar accountId={accountId} />
          <MenuLink
            link="/profile"
            name="View Profile"
            className={styles.profileButton}
          />
        </li>
        <li className={styles.bookmarksLink}>
          <Bookmark />
          <MenuLink
            link="/bookmarks"
            name="View Bookmarks"
            className={styles.bookmarksButton}
          />
        </li>
        <li className={styles.actions}>
          <div title="Connected provider" className={styles.walletInfo}>
            <span className={styles.walletLogoWrap}>
              {/* <img className={styles.walletLogo} src={activeConnector?.logo} /> */}
              {activeConnector?.name}
            </span>
            <AddNetwork
              chainId={GEN_X_NETWORK_ID}
              networkName="GEN-X Testnet"
            />
            {activeConnector?.name === 'MetaMask' && <AddTokenList />}
          </div>
          <p>
            <Button
              style="text"
              size="small"
              onClick={async () => {
                connect()
                // checkOrbisConnection({ address: accountId })
              }}
            >
              Switch Wallet
            </Button>
            <Button
              style="text"
              size="small"
              onClick={() => {
                disconnect()
                // disconnectOrbis(accountId)
                location.reload()
              }}
            >
              Disconnect
            </Button>
          </p>
        </li>
      </ul>
    </div>
  )
}
