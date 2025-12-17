import { ReactElement } from 'react'
import Button from '@shared/atoms/Button'
// import { useOrbis } from '@context/DirectMessages'
import { useDisconnect, useAccount, useConnect, useConnectors } from 'wagmi'
import styles from './Details.module.css'
import Avatar from '@components/@shared/atoms/Avatar'
import Bookmark from '@images/bookmark.svg'
import DisconnectWallet from '@images/disconnect.svg'
import SwitchWallet from '@images/switchWallet.svg'
import { MenuLink } from '../Menu'
import AddTokenList from './AddTokenList'
import AddNetwork from '@components/@shared/AddNetwork'
import { useSsiWallet } from '@context/SsiWallet'
import { disconnectFromWallet } from '@utils/wallet/ssiWallet'
import { LoggerInstance } from '@oceanprotocol/lib'

export default function Details(): ReactElement {
  const { connector: activeConnector, address: accountId } = useAccount()
  const connectors = useConnectors()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const {
    setSessionToken,
    ssiWalletCache,
    setCachedCredentials,
    clearVerifierSessionCache
  } = useSsiWallet()

  async function disconnectSsiWallet() {
    try {
      ssiWalletCache.clearCredentials()
      setCachedCredentials(undefined)
      clearVerifierSessionCache()
      disconnectFromWallet()
      setSessionToken(undefined)
    } catch (error) {
      LoggerInstance.error(error)
    }
  }

  const handleConnectClick = async () => {
    const connectorToUse = activeConnector || connectors[0]
    if (connectorToUse) {
      connect({ connector: connectorToUse })
    } else {
      LoggerInstance.warn('No connector available to switch to.')
    }
  }

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
            {/* <AddNetwork
              chainId={Number(activeConnector?.id)}
              networkName={activeConnector?.name}
            /> */}
            {activeConnector?.name === 'MetaMask' && <AddTokenList />}
          </div>
          <div>
            <div className={styles.walletActionRow}>
              <SwitchWallet className={styles.walletActionIcon} />
              <Button style="text" size="small" onClick={handleConnectClick}>
                Switch Wallet
              </Button>
            </div>

            <div className={styles.walletActionRow}>
              <DisconnectWallet className={styles.walletActionIcon} />
              <Button
                style="text"
                size="small"
                onClick={async () => {
                  disconnect()
                  // eslint-disable-next-line promise/param-names
                  await new Promise((r) => setTimeout(r, 500))
                  await disconnectSsiWallet()
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}
