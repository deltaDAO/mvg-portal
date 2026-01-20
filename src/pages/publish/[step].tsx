import { ReactElement } from 'react'
import Publish from '../../components/Publish'
import Page from '@shared/Page'
import content from '../../../content/publish/index.json'

export default function PagePublish({
  ssrUri
}: {
  ssrUri: string
}): ReactElement {
  const { title, description } = content

  return (
    <Page title={title} description={description} uri={ssrUri} noPageHeader>
      <Publish content={content} />
    </Page>
  )
}

export async function getServerSideProps({
  params
}: {
  params: { step: string }
}): Promise<{ props: { ssrUri: string } }> {
  return {
    props: {
      ssrUri: `/publish`
    }
  }
}
