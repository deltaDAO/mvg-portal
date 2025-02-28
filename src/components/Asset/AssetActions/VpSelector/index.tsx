import Button from '@components/@shared/atoms/Button'
import { ReactElement, useEffect, useRef } from 'react'
import styles from './index.module.css'
import { SsiVerifiableCredential } from 'src/@types/SsiWallet'

export interface VpSelectorProps {
  showDialog: boolean
  setShowDialog: (boolean) => void
  acceptSelection: () => void
  abortSelection: () => void
  ssiVerifiableCredentials: SsiVerifiableCredential[]
}

export function VpSelector(props: VpSelectorProps): ReactElement {
  const {
    showDialog,
    setShowDialog,
    acceptSelection,
    abortSelection,
    ssiVerifiableCredentials
  } = props
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
        <h3>Verifiable Credentials to present</h3>

        <label htmlFor="ssiWallets" className={styles.marginBottom7px}>
          Choose your VP:
        </label>

        {ssiVerifiableCredentials?.map((credential) => {
          return <>Test</>
        })}

        <div className={styles.panelRow}>
          <Button
            style="primary"
            size="small"
            className={`${styles.width100p} ${styles.acceptButton} ${styles.marginRight2}`}
            onClick={handleAcceptSelection}
          >
            Accept
          </Button>
          <Button
            style="primary"
            size="small"
            className={`${styles.width100p} ${styles.abortButton}`}
            onClick={handleAbortSelection}
          >
            Cancel
          </Button>
        </div>
      </div>
    </dialog>
  )
}
