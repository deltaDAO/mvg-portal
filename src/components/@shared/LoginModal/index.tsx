import { ReactElement, useState } from 'react'
import Modal from '../atoms/Modal'
import { useModal } from 'connectkit'
import { useWalletImport } from '@hooks/useWalletImport'
import { useWalletDecrypt } from '@hooks/useWalletDecrypt'
import LoginMethodSelection from './LoginMethodSelection'
import WalletFileUpload from './WalletFileUpload'
import WalletDecryptForm from './WalletDecryptForm'
import styles from './index.module.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

enum ModalView {
  METHOD_SELECTION = 'METHOD_SELECTION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  PASSWORD_INPUT = 'PASSWORD_INPUT'
}

export default function LoginModal({
  isOpen,
  onClose
}: LoginModalProps): ReactElement {
  const { setOpen: setConnectKitOpen } = useModal()
  const { importFromFile } = useWalletImport()
  const { decrypt, isLoading } = useWalletDecrypt()
  const [currentView, setCurrentView] = useState<ModalView>(
    ModalView.METHOD_SELECTION
  )

  const handleClose = () => {
    setCurrentView(ModalView.METHOD_SELECTION)
    onClose()
  }

  const handleMetaMaskLogin = () => {
    handleClose()
    setConnectKitOpen(true)
  }

  const handleFileImport = async (target: EventTarget) => {
    await importFromFile(target, () => {
      setCurrentView(ModalView.PASSWORD_INPUT)
    })
  }

  const handleDecrypt = async (password: string): Promise<boolean> => {
    const success = await decrypt(password)
    if (success) {
      handleClose()
    }
    return success
  }

  const getModalTitle = (): string => {
    switch (currentView) {
      case ModalView.PASSWORD_INPUT:
        return 'Decrypt Wallet'
      case ModalView.FILE_UPLOAD:
        return 'Import Wallet'
      default:
        return 'Choose Login Method'
    }
  }

  const renderCurrentView = (): ReactElement => {
    switch (currentView) {
      case ModalView.PASSWORD_INPUT:
        return (
          <WalletDecryptForm
            onDecrypt={handleDecrypt}
            onBack={() => setCurrentView(ModalView.METHOD_SELECTION)}
            isLoading={isLoading}
          />
        )
      case ModalView.FILE_UPLOAD:
        return (
          <WalletFileUpload
            onFileChange={handleFileImport}
            onBack={() => setCurrentView(ModalView.METHOD_SELECTION)}
          />
        )
      default:
        return (
          <LoginMethodSelection
            onMetaMaskClick={handleMetaMaskLogin}
            onJsonWalletClick={() => setCurrentView(ModalView.FILE_UPLOAD)}
          />
        )
    }
  }

  return (
    <Modal title={getModalTitle()} isOpen={isOpen} onToggleModal={handleClose}>
      <div className={styles.modalContent}>{renderCurrentView()}</div>
    </Modal>
  )
}
