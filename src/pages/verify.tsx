import React, { ReactElement } from 'react'
import PageVerify from '../components/pages/Verify'
import Page from '../components/templates/Page'
import { graphql, PageProps } from 'gatsby'
import OceanProvider from '../providers/Ocean'

export default function PageGatsbyVerify(props: PageProps): ReactElement {
  const content = (props.data as any).content.edges[0].node.childVerifyJson
  const { title, description } = content
  return (
    <OceanProvider>
      <Page title={title} description={description} uri={props.uri}>
        <PageVerify content={content} />
      </Page>
    </OceanProvider>
  )
}

export const contentQuery = graphql`
  query VerifyPageQuery {
    content: allFile(
      filter: { relativePath: { eq: "pages/verify/index.json" } }
    ) {
      edges {
        node {
          childVerifyJson {
            title
            description
            input {
              label
              placeholder
              buttonLabel
            }
            errorList {
              invalidDid
              noParticipantSelfDescription
              default
            }
          }
        }
      }
    }
  }
`
