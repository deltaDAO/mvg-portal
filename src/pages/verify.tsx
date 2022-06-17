import React, { ReactElement } from 'react'
import PageVerify from '../components/pages/Verify'
import Page from '../components/templates/Page'
import { graphql, PageProps } from 'gatsby'
import OceanProvider from '../providers/Ocean'
import queryString from 'query-string'

export default function PageGatsbyVerify(props: PageProps): ReactElement {
  const content = (props.data as any).content.edges[0].node.childVerifyJson
  const { title, description } = content
  const { did } = queryString.parse(props.location.search)
  return (
    <OceanProvider>
      <Page title={title} description={description} uri={props.uri}>
        <PageVerify content={content} didQueryString={did as string} />
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
            serviceSelfDescriptionSection {
              title
              badgeLabel
            }
            errorSection {
              title
              badgeLabel
            }
            errorList {
              invalidDid
              noServiceSelfDescription
              default
            }
          }
        }
      }
    }
  }
`
