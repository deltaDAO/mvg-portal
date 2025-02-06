import Input from '@components/@shared/FormInput'
import { Field } from 'formik'
import styles from './index.module.css'

export default function TermsAndConditionsCheckbox({
  name,
  license,
  onChange,
  disabled,
  options,
  prefixes,
  postfixes
}: {
  name: string
  license: string[]
  onChange?: (termsAndConditions: boolean) => void
  disabled: boolean
  options?: string[]
  prefixes: string[]
  postfixes?: string[]
}) {
  return (
    <Field
      name={name}
      type="checkbox"
      options={
        options ||
        license.map((option) =>
          option.includes('http') ? 'a custom' : `the ${option}`
        )
      }
      prefixes={prefixes}
      postfixes={postfixes}
      actions={license?.filter((action) => action.includes('http'))}
      component={Input}
      disabled={disabled}
      {...(onChange && { onChange })}
      className={styles.termsAndConditionsCheckbox}
    />
  )
}
