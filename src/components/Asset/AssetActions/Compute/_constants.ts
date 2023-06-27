import * as Yup from 'yup'

export const validationSchema: Yup.SchemaOf<{
  algorithm: string
  computeEnv: string
}> = Yup.object().shape({
  algorithm: Yup.string().required('Required'),
  computeEnv: Yup.string().required('Required')
})

export function getInitialValues(): {
  algorithm: string
  computeEnv: string
} {
  return {
    algorithm: undefined,
    computeEnv: ''
  }
}
