import Cross from '@images/cross.svg'
import { Consent } from '@utils/consents/types'
import { useConsentRowActions } from '../ConsentRowActions'
import styles from './Buttons.module.css'

interface DeleteButtonProps {
  action: (consent: Consent) => void
  children: string
}

function DeleteButton({ action, children }: DeleteButtonProps) {
  const { consent } = useConsentRowActions()

  return (
    <div
      className={styles.item}
      aria-label={`Delete ${children.toLowerCase()}`}
      title={`Delete ${children.toLowerCase()}`}
      onClick={() => action(consent)}
    >
      <Cross />
    </div>
  )
}

export default DeleteButton
