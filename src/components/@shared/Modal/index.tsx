import { updateQueryParameters } from '@utils/searchParams'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext
} from 'react'
import QueryBoundary from '../QueryBoundary'
import Modal from '../atoms/Modal'
import styles from './index.module.css'

interface ModalContextValue {
  openName: string
  openModal: (name: string) => void
  closeModal: () => void
}

const ModalContext = createContext({} as ModalContextValue)

const useModalContext = () => {
  const context = useContext(ModalContext)
  if (!context) throw new Error('Modal components must be used inside Modal')
  return context
}

function ModalProvider({ children }: PropsWithChildren) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const openName = searchParams.get('openName') ?? null

  const openModal = useCallback(
    (name: string) => updateQueryParameters(router, 'openName', name),
    [router]
  )
  const closeModal = useCallback(
    () => updateQueryParameters(router, 'openName', null),
    [router]
  )

  return (
    <ModalContext.Provider
      value={{
        openName,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}

function ModalContent({
  name,
  children
}: PropsWithChildren<{
  name: string
}>) {
  const { openName, closeModal } = useModalContext()

  return (
    <QueryBoundary>
      {openName === name ? (
        <Modal
          title={''}
          isOpen={!!openName}
          onToggleModal={closeModal}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          className={styles.modal}
          style={{
            overlay: {
              backgroundColor: 'transparent'
            }
          }}
        >
          {children}
        </Modal>
      ) : (
        <></>
      )}
    </QueryBoundary>
  )
}

function ModalTrigger({
  name,
  onClick,
  children
}: PropsWithChildren<{ name: string; onClick?: () => void }>) {
  const { openModal } = useModalContext()
  return (
    <span
      onClick={() => {
        openModal(name)
        onClick && onClick()
      }}
    >
      {children}
    </span>
  )
}

function _Modal({ children }: PropsWithChildren) {
  return <ModalProvider>{children}</ModalProvider>
}

_Modal.Trigger = ModalTrigger
_Modal.Content = ModalContent

export default _Modal
export { useModalContext }
