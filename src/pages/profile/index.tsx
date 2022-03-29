import React, { ReactElement, useEffect, useState } from 'react'
import Page from '../../components/templates/Page'
import { graphql, PageProps, navigate } from 'gatsby'
import ProfilePage from '../../components/pages/Profile'
import { accountTruncate } from '../../utils/web3'
import { useWeb3 } from '../../providers/Web3'
import ProfileProvider from '../../providers/Profile'
import { getEnsAddress, getEnsName } from '../../utils/ens'
import ethereumAddress from 'ethereum-address'
import axios, { AxiosResponse } from 'axios'
import { useOcean } from '../../providers/Ocean'
import { useSiteMetadata } from '../../hooks/useSiteMetadata'
import { Logger } from '@oceanprotocol/lib'

export default function PageGatsbyProfile(props: PageProps): ReactElement {
  const { accountId, accountEns } = useWeb3()
  const { ocean } = useOcean()
  const [finalAccountId, setFinalAccountId] = useState<string>()
  const [finalAccountEns, setFinalAccountEns] = useState<string>()

  const { vpRegistryUri } = useSiteMetadata().appConfig

  // Have accountId in path take over, if not present fall back to web3
  useEffect(() => {
    async function init() {
      if (!props?.location?.pathname) return

      const pathAccount = props.location.pathname.split('/')[2]

      // Path is root /profile or /profile/ without an ETH address
      // (happens on manual page refresh) have web3 take over
      if (props.location.pathname === '/profile' || pathAccount === '') {
        setFinalAccountEns(accountEns)
        setFinalAccountId(accountId)
        return
      }

      // Path has ETH addreess
      if (ethereumAddress.isAddress(pathAccount)) {
        const finalAccountId = pathAccount || accountId
        setFinalAccountId(finalAccountId)

        const accountEns = await getEnsName(finalAccountId)
        if (!accountEns) return
        setFinalAccountEns(accountEns)
      } else {
        // Path has ENS name
        setFinalAccountEns(pathAccount)
        const resolvedAccountId = await getEnsAddress(pathAccount)
        setFinalAccountId(resolvedAccountId)
      }
    }
    init()
  }, [props.location.pathname, accountId, accountEns])

  // Replace pathname with ENS name if present
  useEffect(() => {
    if (!finalAccountEns || props.location.pathname === '/profile') return

    const newProfilePath = `/profile/${finalAccountEns}`
    // make sure we only replace path once
    if (newProfilePath !== props.location.pathname)
      navigate(newProfilePath, { replace: true })
  }, [props.location, finalAccountEns, accountId])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const token = params.get('token')
    if (!token || accountId || !ocean) return
    const signMessage = async () => {
      try {
        const signedMessage = await ocean.utils.signature.signText(
          token,
          accountId
        )

        const postOptions = {
          token: token,
          signedMessage,
          address: accountId
        }
        const response: AxiosResponse<any> = await axios.post(
          `${vpRegistryUri}/api/v2/credential/claim'`,
          postOptions
        )
        Logger.debug('[Verification] publisher verification:', response.data)
      } catch (err) {
        Logger.error('[Verification] verification error:', err.message)
      }
    }

    signMessage()
  }, [props.location.pathname, accountId, accountEns, ocean])

  return (
    <Page uri={props.uri} title={accountTruncate(finalAccountId)} noPageHeader>
      <ProfileProvider accountId={finalAccountId} accountEns={finalAccountEns}>
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
