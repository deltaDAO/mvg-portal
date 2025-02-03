import * as Yup from 'yup'
import { getUserCustomParameterValidationSchema } from '../ConsumerParameters/_validation'
import { ConsumerParameter } from '@oceanprotocol/lib'

export function getDownloadValidationSchema(
  parameters: ConsumerParameter[]
): Yup.SchemaOf<{
  dataServiceParams: any
  assetTermsAndConditions: boolean
  portalTermsAndConditions: boolean
}> {
  return Yup.object().shape({
    dataServiceParams: getUserCustomParameterValidationSchema(parameters),
    assetTermsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.'),
    portalTermsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.')
  })
}
