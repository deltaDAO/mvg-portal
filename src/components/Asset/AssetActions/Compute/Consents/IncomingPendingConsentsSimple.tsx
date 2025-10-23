import Time from '@components/@shared/atoms/Time'
import Modal from '@components/@shared/Modal'
import InspectConsent from '@components/Profile/History/Consents/Feed/Actions/Buttons/InspectConsent'
import AssetLink from '@components/Profile/History/Consents/Modal/Components/AssetLink'
import { useUserIncomingConsents } from '@hooks/useUserConsents'
import { Asset } from '@oceanprotocol/lib'
import { Consent } from '@utils/consents/types'
import { isPending } from '@utils/consents/utils'
import styles from './IncomingPendingConsentsSimple.module.css'

interface Props {
  asset: Asset
}

export default function IncomingPendingConsentsSimple({ asset }: Props) {
  const { data: incoming } = useUserIncomingConsents()

  const filtered = incoming.filter(
    (consent: Consent) =>
      isPending(consent) && consent.dataset.includes(asset.id)
  )

  return (
    <>
      {filtered?.length ? (
        <div className={styles.section}>
          <div className={styles.title}>Incoming petitions</div>
          <div className={styles.consentList}>
            {filtered.map((consent) => (
              <div key={consent.id}>
                <div className={styles.consentRow}>
                  <div className={styles.consentDetail}>
                    <AssetLink
                      did={consent.algorithm}
                      className={styles.assetLink}
                      isArrow
                    />
                    <div className={styles.description}>
                      <span>
                        {Object.keys(consent.request).length} request(s)
                      </span>
                      <span>|</span>
                      <Time
                        date={consent.created_at.toString()}
                        isUnix
                        relative
                      />
                    </div>
                  </div>
                  <Modal>
                    <InspectConsent consent={consent} />
                  </Modal>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.noConsents}>No incoming consents</div>
      )}
    </>
  )
}
