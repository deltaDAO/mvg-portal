import React, { ReactElement } from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import Alert from './atoms/Alert'
import Footer from './organisms/Footer'
import Header from './organisms/Header'
import Styles from '../global/Styles'
import { useWeb3 } from '../providers/Web3'
import { useSiteMetadata } from '../hooks/useSiteMetadata'
import { useAccountPurgatory } from '../hooks/useAccountPurgatory'
import styles from './App.module.css'
import PrivacyPreferenceCenter from './organisms/PrivacyPreferenceCenter'
import AnnouncementBanner from './atoms/AnnouncementBanner'

const contentQuery = graphql`
  query AppQuery {
    purgatory: allFile(filter: { relativePath: { eq: "purgatory.json" } }) {
      edges {
        node {
          childContentJson {
            account {
              title
              description
            }
          }
        }
      }
    }
  }
`

export default function App({
  children
}: {
  children: ReactElement
}): ReactElement {
  const data = useStaticQuery(contentQuery)
  const purgatory = data.purgatory.edges[0].node.childContentJson.account

  const { appConfig } = useSiteMetadata()
  const { accountId } = useWeb3()
  const {
    announcement: { main }
  } = useSiteMetadata()
  const { isInPurgatory, purgatoryData } = useAccountPurgatory(accountId)

  return (
    <Styles>
      <div className={styles.app}>
        <AnnouncementBanner text={main} />

        <Header />

        {isInPurgatory && (
          <Alert
            title={purgatory.title}
            badge={`Reason: ${purgatoryData?.reason}`}
            text={purgatory.description}
            state="error"
          />
        )}
        <main className={styles.main}>{children}</main>
        <Footer />

        {appConfig.privacyPreferenceCenter === 'true' && (
          <PrivacyPreferenceCenter style="small" />
        )}
      </div>
    </Styles>
  )
}
