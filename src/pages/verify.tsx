import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Verify from '../components/Verify'
import AssetProvider from '@context/Asset'
import content from '../../content/pages/verify.json'
import Page from '@components/@shared/Page'

export default function PageVerify(): ReactElement {
  const router = useRouter()
  const { did } = router.query

  return (
    <AssetProvider did={did as string}>
      <Page
        title={content.title}
        description={content.description}
        uri={router.route}
      >
        <Verify didQueryString={did as string} />
      </Page>
    </AssetProvider>
  )
}
