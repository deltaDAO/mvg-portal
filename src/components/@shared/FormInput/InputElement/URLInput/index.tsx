import { ReactElement, useEffect, useState } from 'react'
import Button from '@shared/atoms/Button'
import PublishButton from '@shared/PublishButton'
import DeleteButton from '@shared/DeleteButton/DeleteButton'
import { ErrorMessage, useField } from 'formik'
import Loader from '@shared/atoms/Loader'
import styles from './index.module.css'
import InputGroup from '@shared/FormInput/InputGroup'
import InputElement from '@shared/FormInput/InputElement'
import isUrl from 'is-url-superb'
import { isCID } from '@utils/ipfs'

export interface URLInputProps {
  submitText: string
  handleButtonClick(e: React.SyntheticEvent, data: string): void
  isLoading: boolean
  name: string
  checkUrl?: boolean
  storageType?: string
  hideButton?: boolean
  hideError?: boolean
  placeholder?: string
  buttonStyle?: 'primary' | 'ghost' | 'text' | 'publish' | 'ocean'
  showDeleteButton?: boolean
  onDelete?: () => void
  disabled?: boolean
  disableButton?: boolean
}

export default function URLInput({
  submitText,
  handleButtonClick,
  isLoading,
  name,
  checkUrl,
  storageType,
  hideButton,
  hideError = false,
  placeholder,
  buttonStyle = 'publish',
  showDeleteButton = false,
  onDelete,
  disabled = false,
  disableButton = false,
  ...props
}: URLInputProps): ReactElement {
  const [field, meta] = useField(name)
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const inputValues = (props as any)?.value

  // Apply error styling
  const inputClassName = `${styles.input} ${
    !isLoading && meta.error !== undefined && meta.touched
      ? styles.hasError
      : ''
  }`

  useEffect(() => {
    if (!field?.value) return

    setIsButtonDisabled(
      !field?.value ||
        field.value === '' ||
        (checkUrl && storageType === 'url' && !isUrl(field.value)) ||
        (checkUrl && storageType === 'ipfs' && !isCID(field.value)) ||
        (checkUrl &&
          storageType === 'graphql' &&
          !isCID(field.value) &&
          !inputValues[0]?.query) ||
        field.value.includes('javascript:') ||
        (storageType === 'smartcontract' && !inputValues[0]?.abi) ||
        meta?.error
    )
  }, [field?.value, meta?.error, inputValues])

  return (
    <>
      <InputGroup>
        <InputElement
          className={inputClassName}
          {...props}
          {...field}
          type="url"
          placeholder={placeholder}
          data-storage-type={storageType}
          disabled={disabled}
        />

        {!hideButton &&
          (submitText === 'Validate' ? (
            <PublishButton
              icon="validate"
              text={submitText}
              buttonStyle="primary"
              onClick={(e: React.SyntheticEvent) => {
                e.preventDefault()
                handleButtonClick(e, field.value)
              }}
              disabled={isButtonDisabled || isLoading || disableButton}
            />
          ) : (
            <Button
              style={buttonStyle}
              size="default"
              onClick={(e: React.SyntheticEvent) => {
                e.preventDefault()
                handleButtonClick(e, field.value)
              }}
              disabled={isButtonDisabled || disableButton}
            >
              {isLoading ? <Loader white /> : submitText}
            </Button>
          ))}

        {showDeleteButton && onDelete && <DeleteButton onClick={onDelete} />}
      </InputGroup>

      {!hideError && meta.touched && meta.error && (
        <div className={styles.error}>
          <ErrorMessage name={field.name}>
            {(msg) => {
              if (typeof msg === 'string') {
                return msg
              } else if (Array.isArray(msg) && msg[0]?.url) {
                return msg[0].url
              } else if (msg && typeof msg === 'object' && msg.url) {
                return msg.url
              }
              return String(msg)
            }}
          </ErrorMessage>
        </div>
      )}
    </>
  )
}
