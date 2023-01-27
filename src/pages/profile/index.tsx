import React, { ReactElement, useEffect, useState } from 'react'
import Page from '../../components/templates/Page'
import { graphql, PageProps } from 'gatsby'
import ProfilePage from '../../components/pages/Profile'
import { accountTruncate } from '../../utils/web3'
import { useWeb3 } from '../../providers/Web3'
import ProfileProvider from '../../providers/Profile'
import ethereumAddress from 'ethereum-address'

export default function PageGatsbyProfile(props: PageProps): ReactElement {
  const { accountId } = useWeb3()
  const [finalAccountId, setFinalAccountId] = useState<string>()

  // Have accountId in path take over, if not present fall back to web3
  useEffect(() => {
    async function init() {
      if (!props?.location?.pathname) return

      const pathAccount = props.location.pathname.split('/')[2]

      // Path is root /profile or /profile/ without an ETH address
      // (happens on manual page refresh) have web3 take over
      if (props.location.pathname === '/profile' || pathAccount === '') {
        setFinalAccountId(accountId)
        return
      }

      if (ethereumAddress.isAddress(pathAccount)) {
        const finalAccountId = pathAccount || accountId
        setFinalAccountId(finalAccountId)
      }
    }
    init()
  }, [props.location.pathname, accountId])

  return (
    <Page uri={props.uri} title={accountTruncate(finalAccountId)} noPageHeader>
      <ProfileProvider accountId={finalAccountId}>
        <ProfilePage accountId={finalAccountId} />
      </ProfileProvider>
    </Page>
  )
}

export const contentQuery = graphql`
  query ProfilePageQuery {
    content: allFile(filter: { relativePath: { eq: "pages/profile.json" } }) {
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
