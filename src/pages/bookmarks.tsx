import { ReactElement } from 'react'
import Page from '@shared/Page'
import { useRouter } from 'next/router'
import Bookmarks from '@components/Home/Bookmarks'
import content from '../../content/pages/bookmarks.json'

export default function PageHome(): ReactElement {
  const router = useRouter()
  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.pathname}>
      <Bookmarks />
    </Page>
  )
}
