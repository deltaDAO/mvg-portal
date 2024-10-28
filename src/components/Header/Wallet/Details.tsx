import { ReactElement } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import styles from './Details.module.css'
import Avatar from '@components/@shared/atoms/Avatar'
import Bookmark from '@images/bookmark.svg'
import { MenuLink } from '../Menu'
import Button from '@components/@shared/atoms/Button'

export default function Details(): ReactElement {
  const { address: accountId, connector: activeConnector } = useAccount()

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
        <li>
          <div title="Connected provider" className={styles.walletInfo}>
            <span className={styles.walletLogoWrap}>
              {activeConnector?.name}
            </span>
          </div>
          <div className={styles.actions}>
            <Button
              style="text"
              size="small"
              onClick={async () => {
                connect()
              }}
            >
              Switch Wallet
            </Button>
            <Button
              style="text"
              size="small"
              onClick={() => {
                disconnect()
                location.reload()
              }}
            >
              Disconnect
            </Button>
          </div>
        </li>
      </ul>
    </div>
  )
}
