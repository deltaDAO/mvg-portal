import { ReactElement, useState } from 'react'
import { ErrorMessage, useField } from 'formik'
import styles from './index.module.css'
import InputGroup from '@shared/FormInput/InputGroup'
import InputElement from '@shared/FormInput/InputElement'
import Download2Icon from '@images/download2.svg'

export interface MethodInputProps {
  handleButtonClick(method: string): void
  isLoading: boolean
  name: string
  checkUrl?: boolean
  storageType?: string
  hideButton?: boolean
}

export default function MethodInput({
  handleButtonClick,
  isLoading,
  name,
  checkUrl,
  storageType,
  ...props
}: MethodInputProps): ReactElement {
  const [field, meta] = useField(name)
  const [methodSelected, setMethod] = useState(field?.value[0]?.method || 'get')

  return (
    <>
      <InputGroup>
        <InputElement
          className={`${styles.input} ${
            !isLoading && meta.error !== undefined && meta.touched
              ? styles.hasError
              : ''
          }`}
          {...props}
          {...field}
          type="url"
        />

        <div className={styles.methodDropdownWrapper}>
          <select
            className={`${styles.inputMethod} ${
              !isLoading && meta.error !== undefined && meta.touched
                ? styles.hasError
                : ''
            }`}
            name={`${field.name}[0].method`}
            value={methodSelected}
            onChange={(e) => {
              setMethod(e.currentTarget.value)
              handleButtonClick(e.currentTarget.value)
            }}
          >
            <option value="get">GET</option>
            <option value="post">POST</option>
          </select>
          <div className={styles.methodDisplay}>
            <Download2Icon
              className={
                methodSelected === 'get' ? styles.getIcon : styles.postIcon
              }
            />
            <span>{methodSelected}</span>
          </div>
        </div>
      </InputGroup>

      {meta.touched && meta.error && (
        <div className={styles.error}>
          <ErrorMessage name={field.name} />
        </div>
      )}
    </>
  )
}
