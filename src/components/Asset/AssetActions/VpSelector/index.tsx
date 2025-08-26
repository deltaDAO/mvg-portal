import React, { ReactElement, useEffect, useRef, useState } from 'react'
import styles from './index.module.css'
import { SsiVerifiableCredential } from 'src/@types/SsiWallet'
import { getSsiVerifiableCredentialType } from '@utils/wallet/ssiWallet'
import {
  CredentialAddressBased,
  CredentialPolicyBased
} from 'src/@types/ddo/Credentials'

export interface VpSelectorProps {
  showDialog: boolean
  setShowDialog: (boolean) => void
  acceptSelection: (selectedCredential: string[]) => void
  abortSelection: () => void
  ssiVerifiableCredentials: SsiVerifiableCredential[]
  assetAllowCredentials: (CredentialAddressBased | CredentialPolicyBased)[]
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
    <div className={styles.credentialRow}>
      <input
        type="checkbox"
        className={styles.inputField}
        onChange={() => onChange(index, !checked)}
        checked={checked}
      />
      <div className={styles.credentialContent}>
        <div className={styles.credentialName}>
          {getSsiVerifiableCredentialType(credential)}
        </div>
        <div className={styles.fieldData}>
          <div className={styles.fieldNames}>
            <div>Id</div>
            {Object.keys(credential?.parsedDocument?.credentialSubject || {})
              .sort((key1, key2) => key1.localeCompare(key2))
              .map((key) => (
                <div key={key}>{key}</div>
              ))}
          </div>
          <div className={styles.fieldValues}>
            <div>
              <DataView
                data={credential?.parsedDocument?.id}
                maxLength={maxLength}
              />
            </div>
            {Object.keys(credential?.parsedDocument?.credentialSubject || {})
              .sort((key1, key2) => key1.localeCompare(key2))
              .map((key) => (
                <div key={key}>
                  <DataView
                    data={credential?.parsedDocument?.credentialSubject?.[key]}
                    maxLength={maxLength}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function VpSelector(props: VpSelectorProps): ReactElement {
  const {
    showDialog,
    setShowDialog,
    acceptSelection,
    abortSelection,
    ssiVerifiableCredentials,
    assetAllowCredentials
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
      console.log('[VpSelector] opening dialog', {
        creds: ssiVerifiableCredentials?.map(
          (c) => c?.parsedDocument?.id || c?.id
        ),
        count: ssiVerifiableCredentials?.length || 0
      })
      try {
        // Use non-modal dialog to avoid nested modal conflicts inside wizard overlays
        selectorDialog.current.show()
        console.log('[VpSelector] show() called', {
          isOpen: selectorDialog.current?.open
        })
      } catch (e) {
        console.error('[VpSelector] show error', e)
      }
    } else {
      console.log('[VpSelector] closing dialog')
      try {
        selectorDialog.current.close()
      } catch (e) {
        console.error('[VpSelector] close error', e)
      }
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
        <div className={styles.vptitle}>Verifiable Credentials to present</div>
        {/* dynamic datat has to fetch here */}
        <div className={styles.dataInfo}>
          Asset: Dataset 1, Service: Service 1
        </div>

        {(() => {
          const minCreds = (assetAllowCredentials as any)
            ?.find((c) => c.type === 'SSIpolicy')
            ?.values?.[0]?.vp_policies?.find(
              (policy) =>
                (typeof policy === 'object' &&
                  policy.policy === 'minimum-credentials') ||
                (typeof policy === 'string' && policy === 'minimum-credentials')
            )

          const minCount =
            typeof minCreds === 'object' && 'args' in minCreds
              ? minCreds.args
              : null

          return minCount ? (
            <span>
              <strong>Minimum credentials required:</strong> {minCount}
            </span>
          ) : null
        })()}

        <div
          className={`${styles.panelGrid} ${styles.panelTemplateList} ${styles.alignItemsCenter} ${styles.justifyItemsStretch}`}
        >
          {ssiVerifiableCredentials
            ?.sort(sortCredentials)
            .map((credential, index) => {
              return (
                <React.Fragment key={credential.id}>
                  <VpField
                    credential={credential}
                    onChange={handleOnChange}
                    index={index}
                    checked={selections[index] || false}
                  />
                </React.Fragment>
              )
            })}
        </div>

        <div className={styles.panelRow}>
          <button
            type="button"
            className={styles.abortButton}
            onClick={handleAbortSelection}
          >
            Close
          </button>
          <button
            type="button"
            className={styles.acceptButton}
            onClick={handleAcceptSelection}
          >
            Accept
          </button>
        </div>
      </div>
    </dialog>
  )
}
