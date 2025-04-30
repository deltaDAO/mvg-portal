import { ReactElement } from 'react'
import Modal from '../../components/@shared/atoms/Modal'
import styles from './DeleteAutomationModal.module.css'
import Button from '../../components/@shared/atoms/Button'
import Loader from '../../components/@shared/atoms/Loader'

export default function DeleteAutomationModal({
  disabled,
  hasDeleteRequest,
  setHasDeleteRequest,
  onDeleteConfirm
}: {
  disabled: boolean
  hasDeleteRequest: boolean
  setHasDeleteRequest: (hasDeleteRequest: boolean) => void
  onDeleteConfirm: () => void
}): ReactElement {
  return (
    <Modal
      title="Automation Wallet"
      onToggleModal={() => setHasDeleteRequest(!hasDeleteRequest)}
      isOpen={hasDeleteRequest}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        If you delete the wallet you will not be able to access related
        offerings from the portal without reimporting. Do you want to continue?
      </div>

      <div className={styles.modalActions}>
        <Button
          size="small"
          className={styles.modalCancelBtn}
          onClick={() => setHasDeleteRequest(false)}
          disabled={disabled}
        >
          Cancel
        </Button>
        <Button
          size="small"
          className={styles.modalConfirmBtn}
          onClick={() => {
            onDeleteConfirm()
          }}
          disabled={disabled}
        >
          {disabled ? <Loader message={`Loading...`} /> : `Confirm`}
        </Button>
      </div>
    </Modal>
  )
}
