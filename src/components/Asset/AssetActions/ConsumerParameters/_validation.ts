import * as Yup from 'yup'
import { SchemaLike } from 'yup/lib/types'
import { Option } from 'src/@types/ddo/Option'
import { parseConsumerParameterValues } from '.'

export function getUserCustomParameterValidationSchema(
  consumerParameters: Record<string, string | number | boolean | Option[]>[]
): SchemaLike {
  if (!consumerParameters || consumerParameters.length === 0) {
    return Yup.object()
      .nullable()
      .transform(() => ({}))
  }

  const shape = {}

  consumerParameters?.forEach((parameter) => {
    const schemaBase =
      parameter.type === 'number'
        ? Yup.number()
        : parameter.type === 'boolean'
        ? Yup.boolean()
        : Yup.string()

    if ('name' in parameter && typeof parameter.name === 'string') {
      Object.assign(shape, {
        [parameter.name]: parameter.required
          ? schemaBase.required('required')
          : schemaBase.nullable().transform((value) => value || null)
      })
    }
  })

  const schema = Yup.object(shape)

  return schema
}
