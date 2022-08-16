import React, { FormEvent, ReactElement } from 'react'
import { useOcean } from '../../../providers/Ocean'
import { useWeb3 } from '../../../providers/Web3'
import Button from '../../atoms/Button'
import styles from './FormActions.module.css'

export default function FormActions({
  isValid,
  resetFormAndClearStorage
}: {
  isValid: boolean
  resetFormAndClearStorage: (e: FormEvent<Element>) => void
}): ReactElement {
  const { ocean, account } = useOcean()
  const { isChainIdAllowed } = useWeb3()

  return (
    <footer className={styles.actions}>
      <Button
        style="primary"
        type="submit"
        disabled={
          !ocean ||
          !account ||
          !isValid ||
          status === 'empty' ||
          !isChainIdAllowed
        }
      >
        Submit
      </Button>

      {status !== 'empty' && (
        <Button style="text" size="small" onClick={resetFormAndClearStorage}>
          Reset Form
        </Button>
      )}
    </footer>
  )
}
