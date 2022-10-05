import { useField } from 'formik'
import React, { ReactElement, useCallback, useEffect } from 'react'
import { utils } from '@oceanprotocol/lib'
import { InputProps } from '../../../atoms/Input'
import RefreshName from './RefreshName'
import styles from './index.module.css'

export default function Datatoken(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField(props.name)

  const generateName = useCallback(async () => {
    const dataTokenOptions = utils.generateDatatokenName()
    helpers.setValue({ ...dataTokenOptions })
  }, [helpers])

  // Generate new DT name & symbol on first mount
  useEffect(() => {
    if (!field?.value?.name || !field?.value?.symbol) generateName()
  }, [generateName, field?.value?.name, field?.value?.symbol])

  return (
    <div className={styles.datatoken}>
      <strong>{field?.value?.name}</strong> —{' '}
      <strong>{field?.value?.symbol}</strong>
      <RefreshName generateName={generateName} />
    </div>
  )
}
