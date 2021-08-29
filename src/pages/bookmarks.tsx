import React, { ReactElement } from 'react'
import { graphql, PageProps } from 'gatsby'
import Page from '../components/templates/Page'
import PageBookmarks from '../components/pages/Bookmarks'

export const contentQuery = graphql`
  query BookmarksPageQuery {
    content: allFile(filter: { relativePath: { eq: "pages/bookmarks.json" } }) {
      edges {
        node {
          childPagesJson {
            title
            description
          }
        }
      }
    }
  }
`

export default function PageGatsbyBookmarks(props: PageProps): ReactElement {
  const data = (props.data as any).content.edges[0].node.childPagesJson

  const { title, description } = data

  return (
    <Page title={title} uri={props.uri} description={description}>
      <PageBookmarks />
    </Page>
  )
}
