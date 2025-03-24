import Button from '@components/@shared/atoms/Button'
import { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './index.module.css'
import { SsiVerifiableCredential } from 'src/@types/SsiWallet'
import { getSsiVerifiableCredentialType } from '@utils/wallet/ssiWallet'

export interface VpSelectorProps {
  showDialog: boolean
  setShowDialog: (boolean) => void
  acceptSelection: (selectedCredential: string[]) => void
  abortSelection: () => void
  ssiVerifiableCredentials: SsiVerifiableCredential[]
}

interface VpFieldProps {
  credential: SsiVerifiableCredential
  checked: boolean
  index: number
  onChange: (index: number, newValue: boolean) => void
}

function VpField(props: VpFieldProps): ReactElement {
  const { credential, checked, index, onChange } = props
  const maxLength = 60

  function DataView({
    data,
    maxLength
  }: {
    data: any
    maxLength: number
  }): ReactElement {
    let dataString
    if (typeof data === 'string') {
      dataString = data
    } else {
      dataString = JSON.stringify(data)
    }

    return (
      <>
        {dataString?.length > maxLength
          ? dataString?.slice(0, maxLength).concat('...')
          : dataString}
      </>
    )
  }

  return (
    <>
      <label
        className={`${styles.panelRow} ${styles.justifyContentFlexEnd} ${styles.marginRight2} ${styles.flexWrap}`}
      >
        {getSsiVerifiableCredentialType(credential)}
        <input
          type="checkbox"
          className={styles.inputField}
          onChange={() => onChange(index, !checked)}
          checked={checked}
        />
      </label>
      <div
        className={`${styles.panelGrid} ${styles.panelTemplateData} ${styles.marginBottom3}`}
      >
        {Object.keys(credential?.parsedDocument?.credentialSubject || {})
          .sort((key1, key2) => key1.localeCompare(key2))
          .map((key) => {
            return (
              <>
                <div>{key}</div>
                <div>
                  <DataView
                    data={credential?.parsedDocument?.credentialSubject?.[key]}
                    maxLength={maxLength}
                  />
                </div>
              </>
            )
          })}
      </div>
    </>
  )
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
  const [selections, setSelections] = useState<boolean[]>([])

  function handleAcceptSelection() {
    const selectedCredentials = ssiVerifiableCredentials
      .filter((credential, index) => selections[index])
      .map((credential) => credential.id)

    setShowDialog(false)
    acceptSelection(selectedCredentials)
  }

  function handleAbortSelection() {
    setShowDialog(false)
    abortSelection()
  }

  useEffect(() => {
    if (showDialog) {
      const array = new Array(ssiVerifiableCredentials?.length || 0).fill(false)
      setSelections(array)

      selectorDialog.current.showModal()
    } else {
      selectorDialog.current.close()
    }
  }, [showDialog])

  function handleOnChange(index: number, newValue: boolean) {
    const newValues = [...selections]
    newValues[index] = newValue
    setSelections(newValues)
  }

  function sortCredentials(
    credential1: SsiVerifiableCredential,
    credential2: SsiVerifiableCredential
  ) {
    const credential1Type = getSsiVerifiableCredentialType(credential1)
    const credential2Type = getSsiVerifiableCredentialType(credential2)
    return credential1Type.localeCompare(credential2Type)
  }

  return (
    <dialog
      id="vpSelector"
      ref={selectorDialog}
      className={`${styles.dialogBorder} ${styles.dialogWidth}`}
    >
      <div className={`${styles.panelColumn} ${styles.width100p}`}>
        <h3>Verifiable Credentials to present</h3>

        <label htmlFor="verifiableCredentials" className={styles.marginBottom2}>
          Choose your Wallet VPs:
        </label>

        <div
          className={`${styles.panelGrid} ${styles.panelTemplateList} ${styles.alignItemsCenter} ${styles.justifyItemsStrech} ${styles.marginBottom2}`}
        >
          {ssiVerifiableCredentials
            ?.sort(sortCredentials)
            .map((credential, index) => {
              return (
                <VpField
                  key={credential.id}
                  credential={credential}
                  onChange={handleOnChange}
                  index={index}
                  checked={selections[index]}
                />
              )
            })}
        </div>

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
