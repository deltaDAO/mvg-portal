import Button from '@components/@shared/atoms/Button'
import Modal from '@components/@shared/Modal'
import ConsentPetitionModal from '@components/Profile/History/Consents/Modal/ConsentPetitionModal'
import { useHealthcheck } from '@hooks/useUserConsents'
import styles from './ConsentPetitionButton.module.css'
import { useAccount } from 'wagmi'

interface ConsentPetitionButtonProps {
  asset: AssetExtended
}

export default function ConsentPetitionButton({
  asset
}: ConsentPetitionButtonProps) {
  useHealthcheck()

  const { address } = useAccount()

  if (!address) {
    return <></>
  }

  return (
    <span className={styles.requestButtonContainer}>
      Your algorithm is not listed?
      <Modal>
        <Modal.Trigger name={'0'}>
          <Button
            style="text"
            size="small"
            title="Start consent petition"
            type="button"
            className={styles.requestButton}
          >
            Make petition
          </Button>
        </Modal.Trigger>
        <Modal.Content name={'0'}>
          <ConsentPetitionModal asset={asset} />
        </Modal.Content>
      </Modal>
    </span>
  )
}
