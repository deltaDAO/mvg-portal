import React, { ReactElement, useEffect } from 'react'
import HistoryPage from './History'
import AccountHeader from './Header'
import styles from './index.module.css'
import axios, { AxiosResponse } from 'axios'
import { Logger } from '@oceanprotocol/lib'
import { useSiteMetadata } from '../../../hooks/useSiteMetadata'
import { useWeb3 } from '../../../providers/Web3'

export default function AccountPage({
  accountId,
  token
}: {
  accountId: string
  token?: string
}): ReactElement {
  const { web3 } = useWeb3()
  const { vpRegistryUri } = useSiteMetadata().appConfig

  useEffect(() => {
    if (!token || !accountId || !web3) return
    const signMessage = async () => {
      try {
        const signedMessage = await web3.eth.personal.sign(
          token as string,
          accountId,
          undefined
        )

        const postOptions = {
          token: token,
          signedMessage,
          address: accountId
        }
        const response: AxiosResponse<any> = await axios.post(
          `${vpRegistryUri}/api/v2/credential/claim'`,
          postOptions
        )
        Logger.debug('[Verification] publisher verification:', response.data)
      } catch (err) {
        Logger.error('[Verification] verification error:', err.message)
      }
    }

    signMessage()
  }, [token, accountId, ocean])

  return (
    <div className={styles.profile}>
      <AccountHeader accountId={accountId} />
      <HistoryPage accountIdentifier={accountId} />
    </div>
  )
}
