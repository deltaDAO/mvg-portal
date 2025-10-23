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
      try {
        selectorDialog.current.showModal()
      } catch (e) {
        console.error('dialog showModal error', e)
      }
    } else {
      try {
        selectorDialog.current.close()
      } catch (e) {
        console.error('dialog close error', e)
      }
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
                {did?.alias} -{' '}
                {did?.did?.length > maxLength
                  ? did?.did?.slice(0, maxLength).concat('...')
                  : did?.did}
              </option>
            )
          })}
        </select>

        <div className={styles.panelRow}>
          <Button
            type="button"
            style="primary"
            size="small"
            className={`${styles.abortButton}`}
            onClick={handleAbortSelection}
          >
            Cancel
          </Button>
          <Button
            type="button"
            style="primary"
            size="small"
            className={`${styles.acceptButton}`}
            onClick={handleAcceptSelection}
          >
            Confirm
          </Button>
        </div>
      </div>
    </dialog>
  )
}
