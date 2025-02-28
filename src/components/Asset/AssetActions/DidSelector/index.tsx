import Button from '@components/@shared/atoms/Button'
import { ReactElement, useEffect, useRef } from 'react'
import styles from './index.module.css'

export interface DidSelectorProps {
  showDialog: boolean
  setShowDialog: (boolean) => void
  acceptSelection: () => void
  abortSelection: () => void
}

export function DidSelector(props: DidSelectorProps): ReactElement {
  const { showDialog, setShowDialog, acceptSelection, abortSelection } = props
  const selectorDialog = useRef<HTMLDialogElement>(null)

  function handleAcceptSelection() {
    setShowDialog(false)
    acceptSelection()
  }

  function handleAbortSelection() {
    setShowDialog(false)
    abortSelection()
  }

  useEffect(() => {
    if (showDialog) {
      selectorDialog.current.showModal()
    } else {
      selectorDialog.current.close()
    }
  }, [showDialog, setShowDialog])

  return (
    <dialog id="ssiWallet" ref={selectorDialog} className={styles.dialogBorder}>
      <div className={styles.panelColumn}>
        <h3>DID Selector</h3>

        <label htmlFor="ssiWallets" className={styles.marginBottom7px}>
          Choose your DID:
        </label>

        <Button
          style="primary"
          size="small"
          className={`${styles.width100p} ${styles.closeButton}`}
          onClick={handleAcceptSelection}
        >
          Accept
        </Button>
        <Button
          style="primary"
          size="small"
          className={`${styles.width100p} ${styles.closeButton}`}
          onClick={handleAbortSelection}
        >
          Abort
        </Button>
      </div>
    </dialog>
  )
}
