import Input from '@components/@shared/FormInput'
import { Field } from 'formik'

export default function TermsAndConditionsCheckbox({
  actions,
  onChange,
  disabled
}: {
  actions: any
  onChange?: (termsAndConditions: boolean) => void
  disabled: boolean
}) {
  return (
    <Field
      name="termsAndConditions"
      type="checkbox"
      options={['Terms and Conditions']}
      prefixes={['I agree to the']}
      actions={actions}
      component={Input}
      disabled={disabled}
      onChange={onChange}
    />
  )
}
