import { ReactElement, useEffect, useState } from 'react'
import { Field, useField } from 'formik'
import Input, { InputProps } from '../..'
import { FormConsumerParameter } from '@components/Publish/_types'
import DefaultInput from './DefaultInput'
import OptionsInput from './OptionsInput'
import TypeInput from './TypeInput'
import styles from './PublishConsumerParameters.module.css'
import AddParam from '@images/add_param.svg'
import BinIcon from '@images/bin.svg'
import Button from '../../../atoms/Button'

export const defaultConsumerParam: FormConsumerParameter = {
  name: '',
  label: '',
  description: '',
  type: 'text',
  options: undefined,
  default: '',
  required: 'optional'
}

export const paramTypes: FormConsumerParameter['type'][] = [
  'number',
  'text',
  'boolean',
  'select'
]

export function PublishConsumerParameters(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField<FormConsumerParameter[]>(props.name)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!field.value || field.value.length === 0) {
      helpers.setValue([{ ...defaultConsumerParam }])
      setCurrentIndex(0)
    }
  }, [field.value, helpers])

  const parameters = field.value || []
  const currentParam = parameters[currentIndex] || defaultConsumerParam

  const safeCurrentIndex = Math.min(
    currentIndex,
    Math.max(0, parameters.length - 1)
  )

  const addParameter = () => {
    const newParams = [...parameters, { ...defaultConsumerParam }]
    helpers.setValue(newParams)
    setCurrentIndex(newParams.length - 1)
  }

  const deleteParameter = (index: number) => {
    if (parameters.length > 1) {
      const newParams = parameters.filter((_, i) => i !== index)
      helpers.setValue(newParams)
      setCurrentIndex(Math.min(index, newParams.length - 1))
    }
  }

  if (!parameters.length) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className={styles.container}>
        {/* Parameter Tabs - Vertical Stack */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {parameters.map((param, index) => (
              <div
                key={index}
                className={`${styles.tab} ${
                  index === safeCurrentIndex ? styles.activeTab : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                PARAM {index + 1}
                {parameters.length > 1 && index === safeCurrentIndex && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteParameter(safeCurrentIndex)
                    }}
                  >
                    <BinIcon /> Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Parameter Form - Two Column Layout */}
        <div className={styles.formContainer}>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <Field
                name={`${field.name}[${safeCurrentIndex}].name`}
                label="Policy Name"
                required
                component={Input}
                className={styles.fullWidthInput}
              />
            </div>
            <div className={styles.formColumn}>
              <Field
                name={`${field.name}[${safeCurrentIndex}].label`}
                label="Parameter Label"
                required
                component={Input}
                className={styles.fullWidthInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <Field
                name={`${field.name}[${safeCurrentIndex}].description`}
                label="Description"
                required
                component={Input}
                className={styles.fullWidthInput}
              />
            </div>
            <div className={styles.formColumn}>
              <TypeInput
                name={`${field.name}[${safeCurrentIndex}].type`}
                label="Parameter Type"
                required
                type="select"
                options={paramTypes}
                index={safeCurrentIndex}
                inputName={props.name}
                className={styles.fullWidthInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <Field
                name={`${field.name}[${safeCurrentIndex}].required`}
                label="Required"
                required
                type="select"
                options={['optional', 'required']}
                component={Input}
                className={styles.fullWidthInput}
              />
            </div>
            <div className={styles.formColumn}>
              <DefaultInput
                name={`${field.name}[${safeCurrentIndex}].default`}
                label="Default Value"
                required
                index={safeCurrentIndex}
                inputName={props.name}
                className={styles.fullWidthInput}
              />
            </div>
          </div>

          {/* Options field for select type */}
          {currentParam?.type === 'select' && (
            <div className={styles.formRow}>
              <div className={styles.formColumnFull}>
                <OptionsInput
                  name={`${field.name}[${safeCurrentIndex}].options`}
                  label="Options"
                  value={currentParam.options}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Parameter Button */}
      </div>
      <div className={styles.addButtonContainer}>
        <Button type="button" style="gradient" onClick={addParameter}>
          <AddParam /> Add parameter
        </Button>
      </div>
    </>
  )
}
