import Button from '@components/@shared/atoms/Button'
import { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './index.module.css'
import { SsiWalletDid } from 'src/@types/SsiWallet'

export interface DidSelectorProps {
  showDialog: boolean
  setShowDialog: (boolean) => void
  acceptSelection: (selectedDid: SsiWalletDid) => void
  abortSelection: () => void
  dids: SsiWalletDid[]
}

export function DidSelector(props: DidSelectorProps): ReactElement {
  const { showDialog, setShowDialog, acceptSelection, abortSelection, dids } =
    props
  const selectorDialog = useRef<HTMLDialogElement>(null)
  const [selectedDid, setSelectedDid] = useState<SsiWalletDid>()

  function handleAcceptSelection() {
    // const selecteDids = dids
    //  .filter((did, index) => selections[index])
    //   .map((did) => did.keyId)
    //
    setShowDialog(false)
    acceptSelection(selectedDid)
  }

  function handleAbortSelection() {
    setShowDialog(false)
    abortSelection()
  }

  useEffect(() => {
    if (showDialog) {
      if (dids?.length > 0) {
        setSelectedDid(dids[0])
      }

      selectorDialog.current.showModal()
    } else {
      selectorDialog.current.close()
    }
  }, [showDialog, setShowDialog])

  function handleDidSelection(event: any) {
    const selectedDid = dids.find(
      (did) => did.did === (event.target.value as string)
    )
    setSelectedDid(selectedDid)
  }

  const maxLength = 100

  return (
    <dialog
      id="didSelector"
      ref={selectorDialog}
      className={styles.dialogBorder}
    >
      <div className={`${styles.panelColumn} ${styles.width100p}`}>
        <h3>DID Selector</h3>

        <label htmlFor="dids" className={styles.marginBottom2}>
          Choose your DID:
        </label>

        <select
          className={`${styles.panelColumn} ${styles.marginBottom2} ${styles.inputField}`}
          onChange={handleDidSelection}
        >
          {dids?.map((did) => {
            return (
              <option key={did.did} value={`${did.did}`}>
                {did?.did?.length > maxLength
                  ? did?.did?.slice(0, maxLength).concat('...')
                  : did?.did}
              </option>
            )
          })}
        </select>

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
