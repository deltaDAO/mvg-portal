import * as Yup from 'yup'
import { getUserCustomParameterValidationSchema } from '../ConsumerParameters/_validation'
import { Option } from 'src/@types/ddo/Option'

export function getDownloadValidationSchema(
  parameters: Record<string, string | number | boolean | Option[]>[]
) {
  return Yup.object().shape({
    dataServiceParams: getUserCustomParameterValidationSchema(parameters),
    termsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.'),
    acceptPublishingLicense: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Publishing License.')
  })
}
