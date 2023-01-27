import React, { ReactElement } from 'react'
import { PageProps } from 'gatsby'
import Footer from './organisms/Footer/index'
import Header from './organisms/Header'
import Styles from '../global/Styles'
import { useSiteMetadata } from '../hooks/useSiteMetadata'
import AnnouncementBanner from './atoms/AnnouncementBanner'
import styles from './App.module.css'
import PrivacyPreferenceCenter from './organisms/PrivacyPreferenceCenter'

export default function App({
  children,
  ...props
}: {
  children: ReactElement
}): ReactElement {
  const { warning, appConfig } = useSiteMetadata()

  return (
    <Styles>
      <div className={styles.app}>
        {(props as PageProps).uri === '/' && warning.main && (
          <AnnouncementBanner text={warning.main} />
        )}
        <Header />
        <main className={styles.main}>{children}</main>
        <Footer />
        {appConfig.privacyPreferenceCenter === 'true' && (
          <PrivacyPreferenceCenter style="small" />
        )}
      </div>
    </Styles>
  )
}
