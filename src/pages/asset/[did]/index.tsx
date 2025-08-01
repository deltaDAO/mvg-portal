import { ReactElement, useState } from 'react'
import { useRouter } from 'next/router'
import PageTemplateAssetDetails from '../../../components/Asset'
import AssetProvider from '@context/Asset'
import ProfileProvider from '@context/Profile'
import { useAccount } from 'wagmi'

export default function PageAssetDetails(): ReactElement {
  const router = useRouter()
  const { did } = router.query

  const { address: accountId } = useAccount()
  const [ownAccount, setOwnAccount] = useState(false)

  return (
    <ProfileProvider accountId={accountId} ownAccount={ownAccount}>
      <AssetProvider did={did as string}>
        <PageTemplateAssetDetails uri={router.asPath} />
      </AssetProvider>
    </ProfileProvider>
  )
}
