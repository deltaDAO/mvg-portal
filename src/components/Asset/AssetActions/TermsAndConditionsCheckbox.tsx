import Input from '@components/@shared/FormInput'
import { Field } from 'formik'
import styles from './index.module.css'

export default function TermsAndConditionsCheckbox({
  name,
  licenses,
  onChange,
  disabled,
  options,
  prefixes,
  postfixes
}: {
  name: string
  licenses: string[]
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
        licenses?.map((option) =>
          option.includes('http') ? 'a custom' : `the ${option}`
        )
      }
      prefixes={prefixes}
      postfixes={postfixes}
      actions={licenses?.filter((action) => action.includes('http'))}
      component={Input}
      disabled={disabled}
      {...(onChange && { onChange })}
      className={styles.termsAndConditionsCheckbox}
    />
  )
}
