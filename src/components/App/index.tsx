import { ReactElement } from 'react'
import Alert from '@shared/atoms/Alert'
import Footer from '../Footer/Footer'
import Header from '../Header'
import { useAccountPurgatory } from '@hooks/useAccountPurgatory'
import AnnouncementBanner from '@shared/AnnouncementBanner'
import PrivacyPreferenceCenter from '../Privacy/PrivacyPreferenceCenter'
import styles from './index.module.css'
import { ToastContainer } from 'react-toastify'
import contentPurgatory from '../../../content/purgatory.json'
import { useMarketMetadata } from '@context/MarketMetadata'
import { useAccount } from 'wagmi'

export default function App({
  children
}: {
  children: ReactElement
}): ReactElement {
  const { siteContent, appConfig } = useMarketMetadata()
  const { address } = useAccount()
  const { isInPurgatory, purgatoryData } = useAccountPurgatory(address)

  const devPreviewAnnouncementText =
    siteContent?.devPreviewAnnouncement
      ?.replaceAll('SITE-TITLE-PLACEHOLDER', siteContent.siteTitle)
      ?.replaceAll('SITE-LINK-PLACEHOLDER', siteContent.siteUrl) || ''

  return (
    <div className={styles.app}>
      {siteContent?.announcement !== '' && (
        <AnnouncementBanner text={siteContent?.announcement} />
      )}
      {appConfig.showPreviewAlert === 'true' &&
        devPreviewAnnouncementText !== '' && (
          <AnnouncementBanner text={devPreviewAnnouncementText} />
        )}
      <Header />

      {isInPurgatory && (
        <Alert
          title={contentPurgatory.account.title}
          badge={`Reason: ${purgatoryData?.reason}`}
          text={contentPurgatory.account.description}
          state="error"
        />
      )}
      <main className={styles.main}>{children}</main>
      <Footer />

      {appConfig?.privacyPreferenceCenter === 'true' && (
        <PrivacyPreferenceCenter style="small" />
      )}

      <ToastContainer position="bottom-right" newestOnTop />
    </div>
  )
}
