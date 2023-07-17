import * as Yup from 'yup'

export interface ComputeDatasetForm {
  algorithm: string
  computeEnv: string
}

export const validationSchema: Yup.SchemaOf<ComputeDatasetForm> =
  Yup.object().shape({
    algorithm: Yup.string().required('Required'),
    computeEnv: Yup.string().required('Required')
  })

export function getInitialValues(): ComputeDatasetForm {
  return {
    algorithm: undefined,
    computeEnv: ''
  }
}
