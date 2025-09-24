import { ReactElement } from 'react'
import Publish from '../../components/Publish'
import Page from '@shared/Page'
import content from '../../../content/publish/index.json'
import { useRouter } from 'next/router'

export default function PagePublish(): ReactElement {
  const router = useRouter()
  const { title, description } = content

  return (
    <Page
      title={title}
      description={description}
      uri={router.pathname}
      noPageHeader
    >
      <Publish content={content} />
    </Page>
  )
}
