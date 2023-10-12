import {
  ComputeEnvironment,
  ConsumerParameter,
  UserCustomParameters
} from '@oceanprotocol/lib'
import * as Yup from 'yup'
import { getDefaultValues } from '../ConsumerParameters/FormConsumerParameters'
import { getUserCustomParameterValidationSchema } from '../ConsumerParameters/_validation'

export interface ComputeDatasetForm {
  algorithm: string
  computeEnv: string
  dataServiceParams: UserCustomParameters
  algoServiceParams: UserCustomParameters
  algoParams: UserCustomParameters
  termsAndConditions: boolean
}

export function getComputeValidationSchema(
  dataServiceParams: ConsumerParameter[],
  algoServiceParams: ConsumerParameter[],
  algoParams: ConsumerParameter[]
): Yup.SchemaOf<{
  algorithm: string
  computeEnv: string
  dataServiceParams: any
  algoServiceParams: any
  algoParams: any
  termsAndConditions: boolean
}> {
  return Yup.object().shape({
    algorithm: Yup.string().required('Required'),
    computeEnv: Yup.string().required('Required'),
    dataServiceParams:
      getUserCustomParameterValidationSchema(dataServiceParams),
    algoServiceParams:
      getUserCustomParameterValidationSchema(algoServiceParams),
    algoParams: getUserCustomParameterValidationSchema(algoParams),
    termsAndConditions: Yup.boolean()
      .required('Required')
      .isTrue('Please agree to the Terms and Conditions.')
  })
}

export function getInitialValues(
  asset?: AssetExtended,
  selectedAlgorithmAsset?: AssetExtended,
  selectedComputeEnv?: ComputeEnvironment,
  termsAndConditions?: boolean
): ComputeDatasetForm {
  return {
    algorithm: selectedAlgorithmAsset?.id,
    computeEnv: selectedComputeEnv?.id,
    dataServiceParams: getDefaultValues(asset?.services[0].consumerParameters),
    algoServiceParams: getDefaultValues(
      selectedAlgorithmAsset?.services[0].consumerParameters
    ),
    algoParams: getDefaultValues(
      selectedAlgorithmAsset?.metadata?.algorithm.consumerParameters
    ),
    termsAndConditions: !!termsAndConditions
  }
}
