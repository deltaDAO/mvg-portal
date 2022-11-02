import React, { FormEvent, ReactElement } from 'react'
import Alert from '../../atoms/Alert'
import Button from '../../atoms/Button'
import Loader from '../../atoms/Loader'

import styles from './StepAction.module.css'

export interface IStepAction {
  buttonLabel: string
  buttonAction: (e: FormEvent) => void
  loading: boolean
  completed: boolean
  loadingMessage?: string
  successMessage?: string
}

export default function StepAction({
  buttonLabel,
  buttonAction,
  successMessage,
  loading,
  completed,
  loadingMessage
}: IStepAction): ReactElement {
  return (
    <div className={styles.container}>
      {loading ? (
        <Loader message={loadingMessage} useDefaultMessage />
      ) : completed && successMessage ? (
        <Alert
          text={successMessage}
          state="success"
          className={styles.success}
        />
      ) : (
        <Button style="primary" onClick={buttonAction}>
          {buttonLabel}
        </Button>
      )}
    </div>
  )
}
