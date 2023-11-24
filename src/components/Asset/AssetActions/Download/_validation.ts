import * as Yup from 'yup'
import { getUserCustomParameterValidationSchema } from '../ConsumerParameters/_validation'
import { ConsumerParameter } from '@oceanprotocol/lib'

export function getDownloadValidationSchema(
  parameters: ConsumerParameter[]
): Yup.SchemaOf<{
  dataServiceParams: any
  termsAndConditions: boolean
}> {
  return Yup.object().shape({
    dataServiceParams: getUserCustomParameterValidationSchema(parameters),
    termsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.')
  })
}
