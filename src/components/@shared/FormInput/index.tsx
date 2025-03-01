import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  useEffect,
  useState
} from 'react'
import InputElement from './InputElement'
import Label from './Label'
import styles from './index.module.css'
import { ErrorMessage, FieldInputProps } from 'formik'
import classNames from 'classnames/bind'
import Disclaimer from './Disclaimer'
import Tooltip from '@shared/atoms/Tooltip'
import Markdown from '@shared/Markdown'
import FormHelp from './Help'
import { AssetSelectionAsset } from '@shared/FormInput/InputElement/AssetSelection'
import { BoxSelectionOption } from '@shared/FormInput/InputElement/BoxSelection'
import { getObjectPropertyByPath } from '@utils/index'
import { ComputeEnvironment } from '@oceanprotocol/lib'

const cx = classNames.bind(styles)

export interface InputProps {
  name: string
  label?: string | ReactNode
  placeholder?: string
  required?: boolean
  help?: string
  prominentHelp?: boolean
  tag?: string
  type?: string
  options?:
    | string[]
    | AssetSelectionAsset[]
    | BoxSelectionOption[]
    | ComputeEnvironment[]
  sortOptions?: boolean
  fields?: FieldInputProps<any>[]
  methods?: boolean
  innerFields?: any
  additionalComponent?: ReactElement
  value?: string | number
  onChange?(
    e:
      | FormEvent<HTMLInputElement>
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLSelectElement>
      | ChangeEvent<HTMLTextAreaElement>
  ): void
  onKeyPress?(
    e:
      | KeyboardEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement>
      | KeyboardEvent<HTMLSelectElement>
      | KeyboardEvent<HTMLTextAreaElement>
  ): void
  rows?: number
  multiple?: boolean
  pattern?: string
  min?: string
  max?: string
  disabled?: boolean
  readOnly?: boolean
  field?: FieldInputProps<any>
  form?: any
  prefix?: string | ReactElement
  postfix?: string | ReactElement
  prefixes?: string[]
  postfixes?: string[]
  step?: string
  defaultChecked?: boolean
  size?: 'mini' | 'small' | 'large' | 'default'
  className?: string
  checked?: boolean
  disclaimer?: string
  disclaimerValues?: string[]
  accountId?: string
  actions?: string[]
  fieldFormPrefix?: string
}

function checkError(form: any, field: FieldInputProps<any>) {
  const touched = getObjectPropertyByPath(form?.touched, field?.name)
  const errors = getObjectPropertyByPath(form?.errors, field?.name)

  return (
    touched &&
    errors &&
    !field.name.endsWith('.files') &&
    !field.name.endsWith('.links') &&
    !field.name.endsWith('.providerUrl') &&
    !field.name.endsWith('consumerParameters')
  )
}

export default function Input(props: Partial<InputProps>): ReactElement {
  const {
    label,
    help,
    prominentHelp,
    additionalComponent,
    size,
    form,
    field,
    disclaimer,
    disclaimerValues,
    className
  } = props

  const isFormikField = typeof field !== 'undefined'
  // TODO: this feels hacky as it assumes nested `values` store. But we can't use the
  // `useField()` hook in here to get `meta.error` so we have to match against form?.errors?
  // handling flat and nested data at same time.
  const hasFormikError = checkError(form, field)

  const styleClasses = cx({
    field: true,
    hasError: hasFormikError,
    [className]: className
  })

  const [disclaimerVisible, setDisclaimerVisible] = useState(true)

  useEffect(() => {
    if (!isFormikField) return

    if (disclaimer && disclaimerValues) {
      setDisclaimerVisible(
        disclaimerValues.includes(
          getObjectPropertyByPath(props.form?.values, field?.name)
        )
      )
    }
  }, [isFormikField, props.form?.values])

  return (
    <div className={styleClasses}>
      <Label htmlFor={props.name}>
        {label}
        {props.required && (
          <span title="Required" className={styles.required}>
            *
          </span>
        )}
        {help && !prominentHelp && (
          <Tooltip content={<Markdown text={help} />} />
        )}
      </Label>
      <InputElement size={size} {...field} {...props} />
      {help && prominentHelp && <FormHelp>{help}</FormHelp>}

      {field?.name !== 'files' && isFormikField && hasFormikError && (
        <div className={styles.error}>
          <ErrorMessage name={field.name} />
        </div>
      )}

      {disclaimer && (
        <Disclaimer visible={disclaimerVisible}>{disclaimer}</Disclaimer>
      )}
      {additionalComponent && additionalComponent}
    </div>
  )
}
