import React, { ReactElement } from 'react'
import PageEdge from '../components/pages/Edge'
import Page from '../components/templates/Page'
import { graphql, PageProps } from 'gatsby'

export default function PageGatsbyEdge(props: PageProps): ReactElement {
  const content = (props.data as any).content.edges[0].node.childEdgeJson
  const { title, description } = content
  return (
    <Page title={title} description={description} uri={props.uri}>
      <PageEdge location={props.location} />
    </Page>
  )
}

export const contentQuery = graphql`
  query EdgePageQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/edge/index.json" } }
    ) {
      edges {
        node {
          childEdgeJson {
            title
            description
          }
        }
      }
    }
  }
`
