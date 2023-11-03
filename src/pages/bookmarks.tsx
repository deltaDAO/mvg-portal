import { ReactElement } from 'react'
import Page from '@shared/Page'
import router from 'next/router'
import Bookmarks from '@components/Home/Bookmarks'
import content from '../../content/pages/bookmarks.json'

export default function PageHome(): ReactElement {
  const { title, description } = content

  return (
    <Page title={title} description={description} uri={router.route}>
      <Bookmarks />
    </Page>
  )
}
