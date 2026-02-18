import { ReactElement, useState } from 'react'
import Button from '../../../@shared/atoms/Button'
import styles from './Import.module.css'
import LoginModal from '../../../@shared/LoginModal'

export default function Import(): ReactElement {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false)

  return (
    <div className={styles.wrapper}>
      <Button onClick={() => setShowLoginModal(true)} className={styles.button}>
        Login
      </Button>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
