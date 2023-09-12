import React, { ReactElement, useEffect, useState } from 'react'
import Page from '@shared/Page'
import ProfilePage from '../../components/Profile'
import { accountTruncate } from '@utils/wallet'
import ProfileProvider from '@context/Profile'
import { useRouter } from 'next/router'
import { useAccount } from 'wagmi'
import { isAddress } from 'ethers/lib/utils'

export default function PageProfile(): ReactElement {
  const router = useRouter()
  const { address: accountId } = useAccount()
  const [finalAccountId, setFinalAccountId] = useState<string>()
  const [ownAccount, setOwnAccount] = useState(false)

  // Have accountId in path take over, if not present fall back to web3
  useEffect(() => {
    async function init() {
      if (!router?.route) return

      // Path is root /profile, have web3 take over
      if (router.route === '/profile') {
        setFinalAccountId(accountId)
        setOwnAccount(true)
        return
      }

      const pathAccount = router.query.account as string

      // Path has ETH address
      if (isAddress(pathAccount)) {
        setOwnAccount(pathAccount === accountId)
        const finalAccountId = pathAccount || accountId
        setFinalAccountId(finalAccountId)
      }
    }
    init()
  }, [router, accountId])

  return (
    <Page
      uri={router.route}
      title={accountTruncate(finalAccountId)}
      noPageHeader
    >
      <ProfileProvider accountId={finalAccountId} ownAccount={ownAccount}>
        <ProfilePage accountId={finalAccountId} />
      </ProfileProvider>
    </Page>
  )
}
