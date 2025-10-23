import Loader from '@components/@shared/atoms/Loader'
import Modal from '@components/@shared/Modal'
import { useCurrentConsent } from '@hooks/useCurrentConsent'
import { Consent } from '@utils/consents/types'
import { Suspense } from 'react'
import { DeleteConsentModal } from '../../../Modal/DeleteConsentModal'
import styles from './Buttons.module.css'
import classNames from 'classnames'
import Cross from '@images/cross.svg'

const cx = classNames.bind(styles)

interface DeleteConsentProperties {
  consent: Consent
  isResponse?: boolean
}

function DeleteConsent({
  consent,
  isResponse
}: Readonly<DeleteConsentProperties>) {
  const { setCurrentConsent } = useCurrentConsent()

  return (
    <>
      <Modal.Trigger
        name={`${consent.id}_delete`}
        onClick={() => setCurrentConsent(consent)}
      >
        <button
          className={cx(styles.button, styles.deleteButton)}
          title="Delete"
          aria-label="Delete Consent"
          type="button"
        >
          Delete {isResponse ? 'Response' : 'Consent'} <Cross />
        </button>
      </Modal.Trigger>
      <Modal.Content name={`${consent.id}_delete`}>
        <Suspense fallback={<Loader />}>
          <DeleteConsentModal isResponse={isResponse} />
        </Suspense>
      </Modal.Content>
    </>
  )
}

export default DeleteConsent
