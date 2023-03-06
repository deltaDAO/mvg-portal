import React, { ReactElement } from 'react'
import { useRouter } from 'next/router'
import PageVerify from '../components/Verify'
import AssetProvider from '@context/Asset'
import content from '../../content/pages/verify.json'
import Page from '@components/@shared/Page'

export default function PageAssetDetails(): ReactElement {
  const router = useRouter()
  const { did } = router.query

  return (
    <AssetProvider did={did as string}>
      <Page
        title={content.title}
        description={content.description}
        uri={router.route}
      >
        <PageVerify didQueryString={did as string} />
      </Page>
    </AssetProvider>
  )
}
