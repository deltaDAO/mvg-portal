import { ReactElement, useState } from 'react'
import styles from './index.module.css'
import Modal from 'react-modal'

export default function InteractiveModalImage({
  src,
  alt
}: {
  src: string
  alt?: string
}): ReactElement {
  const [modalIsOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={styles.imagePreview} onClick={() => setIsOpen(true)}>
        <img src={src} alt={alt} />
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={() => setIsOpen(false)}>
        <div className={styles.modal} onClick={() => setIsOpen(false)}>
          <button id={styles.close} onClick={() => setIsOpen(false)}>
            close
          </button>
          <img src={src} alt={alt} />
        </div>
      </Modal>
    </>
  )
}
