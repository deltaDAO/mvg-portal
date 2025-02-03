import Input from '@components/@shared/FormInput'
import { Field } from 'formik'
import styles from './index.module.css'

export default function TermsAndConditionsCheckbox({
  name,
  actions,
  onChange,
  disabled,
  options,
  prefixes,
  postfixes
}: {
  name: string
  actions?: any
  onChange?: (termsAndConditions: boolean) => void
  disabled: boolean
  options: string[]
  prefixes: string[]
  postfixes?: string[]
}) {
  return (
    <Field
      name={name}
      type="checkbox"
      options={options}
      prefixes={prefixes}
      postfixes={postfixes}
      actions={actions}
      component={Input}
      disabled={disabled}
      {...(onChange && { onChange })}
      className={styles.termsAndConditionsCheckbox}
    />
  )
}
