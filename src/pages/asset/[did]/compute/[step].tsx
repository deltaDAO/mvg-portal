import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import ComputeWizard from '../../../../components/ComputeWizard'
import Page from '@shared/Page'
import content from '../../../../../content/compute/index.json'
import AssetProvider from '@context/Asset'

export default function PageCompute(): ReactElement {
  const router = useRouter()
  const { did, step } = router.query
  const { title, description } = content

  return (
    <AssetProvider did={did as string}>
      <Page
        title={title}
        description={description}
        uri={router.route}
        noPageHeader
      >
        <ComputeWizard content={content} />
      </Page>
    </AssetProvider>
  )
}
