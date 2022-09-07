import React, { ReactElement, useEffect, useState } from 'react'
import Button from '../../atoms/Button'
import AddToken from '../../atoms/AddToken'
import { useWeb3 } from '../../../providers/Web3'
import Web3Feedback from '../Web3Feedback'
import styles from './Details.module.css'
import { getOceanConfig } from '../../../utils/ocean'
import Debug from '../UserPreferences/Debug'
import Onboarding from '../UserPreferences/Onboarding'
import Blockies from '../../atoms/Blockies'
import { MenuLink } from '../Menu'
import { ReactComponent as Bookmark } from '../../../images/bookmark.svg'

export default function Details(): ReactElement {
  const {
    accountId,
    web3Provider,
    web3ProviderInfo,
    web3Modal,
    connect,
    logout,
    networkData,
    networkId
  } = useWeb3()
  const [oceanTokenMetadata, setOceanTokenMetadata] =
    useState<{
      address: string
      symbol: string
    }>()
  // const [portisNetwork, setPortisNetwork] = useState<string>()

  useEffect(() => {
    if (!networkId) return

    const oceanConfig = getOceanConfig(networkId)

    oceanConfig &&
      setOceanTokenMetadata({
        address: oceanConfig.oceanTokenAddress,
        symbol: oceanConfig.oceanTokenSymbol
      })
  }, [networkData, networkId])

  // Handle network change for Portis
  // async function handlePortisNetworkChange(e: ChangeEvent<HTMLSelectElement>) {
  //   setPortisNetwork(e.target.value)
  //   const portisNetworkName = e.target.value.toLowerCase()
  //   await web3Provider._portis.changeNetwork(portisNetworkName)
  //   // TODO: using our connect initializes a new Portis instance,
  //   // which then defaults back to initial network (Mainnet).
  //   // await connect()
  // }

  return (
    <div className={styles.details}>
      <ul>
        <li className={styles.profileLink}>
          <Blockies accountId={accountId} />
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
              <img className={styles.walletLogo} src={web3ProviderInfo?.logo} />
              {web3ProviderInfo?.name}
            </span>
            {/* {web3ProviderInfo?.name === 'Portis' && (
              <InputElement
                name="network"
                type="select"
                options={['Mainnet', 'Ropsten', 'Rinkeby']}
                size="mini"
                value={portisNetwork}
                onChange={handlePortisNetworkChange}
              />
            )} */}
            {web3ProviderInfo?.name === 'MetaMask' && (
              <AddToken
                address={oceanTokenMetadata?.address}
                symbol={oceanTokenMetadata?.symbol}
                logo="https://raw.githubusercontent.com/oceanprotocol/art/main/logo/token.png"
                className={styles.addToken}
              />
            )}
          </div>
          <p>
            {web3ProviderInfo?.name === 'Portis' && (
              <Button
                style="text"
                size="small"
                onClick={() => web3Provider._portis.showPortis()}
              >
                Show Portis
              </Button>
            )}
            <Button
              style="text"
              size="small"
              onClick={async () => {
                await web3Modal?.clearCachedProvider()
                connect()
              }}
            >
              Switch Wallet
            </Button>
            <Button
              style="text"
              size="small"
              onClick={() => {
                logout()
                location.reload()
              }}
            >
              Disconnect
            </Button>
          </p>
        </li>
        <li className={styles.onboarding}>
          <Onboarding />
        </li>
        <li className={styles.debug}>
          <Debug />
        </li>
      </ul>
      <Web3Feedback />
    </div>
  )
}
