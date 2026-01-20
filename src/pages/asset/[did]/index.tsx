import { ReactElement } from 'react'
import PageTemplateAssetDetails from '../../../components/Asset'
import AssetProvider from '@context/Asset'

export default function PageAssetDetails({
  ssrUri,
  did
}: {
  ssrUri: string
  did: string
}): ReactElement {
  return (
    <AssetProvider did={did}>
      <PageTemplateAssetDetails uri={ssrUri} />
    </AssetProvider>
  )
}

export async function getServerSideProps({
  params
}: {
  params: { did: string }
}): Promise<{ props: { ssrUri: string; did: string } }> {
  const { did } = params
  return {
    props: {
      ssrUri: `/asset/${did}`,
      did
    }
  }
}
