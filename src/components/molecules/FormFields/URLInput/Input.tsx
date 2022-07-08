import React, { ReactElement, useEffect, useState } from 'react'
import Button from '../../../atoms/Button'
import { FieldInputProps, useField } from 'formik'
import Loader from '../../../atoms/Loader'
import styles from './Input.module.css'
import InputGroup from '../../../atoms/Input/InputGroup'
import isUrl from 'is-url-superb'

export const isSanitizedUrl = (url: string): boolean => {
  return url !== '' && isUrl(url) && !url.includes('javascript:')
}

export default function URLInput({
  submitText,
  handleButtonClick,
  isLoading,
  ...props
}: {
  submitText: string
  handleButtonClick(e: React.SyntheticEvent, data: string): void
  isLoading: boolean
}): ReactElement {
  const [field, meta] = useField(props as FieldInputProps<any>)

  const [buttonDisabled, setButtonDisabled] = useState(true)

  useEffect(() => {
    if (!field?.value || field?.value?.length === 0) return

    const isValueValid = isSanitizedUrl(field.value)

    setButtonDisabled(!isValueValid)
  }, [field?.value, meta?.error])

  return (
    <InputGroup>
      <input
        className={styles.input}
        {...props}
        type="url"
        onBlur={(e: React.SyntheticEvent) => handleButtonClick(e, field.value)}
      />

      <Button
        style="primary"
        onClick={(e: React.SyntheticEvent) => e.preventDefault()}
        disabled={buttonDisabled}
      >
        {isLoading ? <Loader /> : submitText}
      </Button>
    </InputGroup>
  )
}
